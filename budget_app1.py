from flask import Flask, render_template, request, redirect, url_for, flash
import pandas as pd
from datetime import datetime, timedelta
import os
import json
import plotly
import plotly.express as px
import plotly.graph_objects as go

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Replace with a secure secret key in production

# Initialize global variables
transactions = pd.DataFrame(columns=["Date", "Type", "Category", "Amount", "Description"])
categories = [
    "Salary", "Rent", "Utilities", "Groceries", "Transportation", 
    "Entertainment", "Healthcare", "Shopping", "Insurance", "Savings",
    "Dining Out", "Education", "Gifts", "Travel", "Other"
]
budget_goals = {}

# Helper Functions
def save_data():
    """Save all data to files"""
    try:
        if not os.path.exists('data'):
            os.makedirs('data')
        
        transactions.to_csv('data/transactions.csv', index=False)
        
        with open('data/budget_goals.json', 'w') as f:
            json.dump(budget_goals, f)
            
        with open('data/categories.json', 'w') as f:
            json.dump(categories, f)
        
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

def load_data():
    """Load all data from files"""
    global transactions, budget_goals, categories
    try:
        if os.path.exists('data/transactions.csv'):
            transactions = pd.read_csv('data/transactions.csv')
            transactions['Date'] = pd.to_datetime(transactions['Date'])
            
        if os.path.exists('data/budget_goals.json'):
            with open('data/budget_goals.json', 'r') as f:
                budget_goals = json.load(f)
                
        if os.path.exists('data/categories.json'):
            with open('data/categories.json', 'r') as f:
                categories = json.load(f)
                
        return True
    except Exception as e:
        print(f"Error loading data: {e}")
        return False

def get_recent_transactions(limit=5):
    """Get the most recent transactions"""
    if transactions.empty:
        return []
    return transactions.sort_values('Date', ascending=False).head(limit).to_dict('records')

def calculate_current_spending():
    """Calculate current spending by category"""
    if transactions.empty:
        return {}
    return transactions[transactions['Type'] == 'Expense'].groupby('Category')['Amount'].sum().to_dict()

# Routes
@app.route('/')
def home():
    load_data()
    
    total_income = 0
    total_expenses = 0
    if not transactions.empty:
        total_income = transactions[transactions['Type'] == 'Income']['Amount'].sum()
        total_expenses = transactions[transactions['Type'] == 'Expense']['Amount'].sum()
    
    return render_template('index.html',
                         total_income=total_income,
                         total_expenses=total_expenses,
                         balance=total_income - total_expenses,
                         recent_transactions=get_recent_transactions(),
                         budget_goals=budget_goals,
                         current_spending=calculate_current_spending())

@app.route('/add_transaction', methods=['GET', 'POST'])
def add_transaction():
    if request.method == 'POST':
        try:
            new_transaction = pd.DataFrame({
                'Date': [request.form['date']],
                'Type': [request.form['type']],
                'Category': [request.form['category']],
                'Amount': [float(request.form['amount'])],
                'Description': [request.form['description']]
            })
            global transactions
            transactions = pd.concat([transactions, new_transaction], ignore_index=True)
            save_data()
            flash('Transaction added successfully!', 'success')
            return redirect(url_for('view_transactions'))
        except Exception as e:
            flash(f'Error adding transaction: {str(e)}', 'error')
    return render_template('add_transaction.html', categories=categories)

@app.route('/view_transactions')
def view_transactions():
    sort_by = request.args.get('sort_by', 'Date')
    filter_category = request.args.get('category', 'All')
    date_range = request.args.get('date_range', 'all')
    
    filtered_transactions = transactions.copy()
    
    # Apply date filter
    if date_range == 'month':
        filtered_transactions = filtered_transactions[
            filtered_transactions['Date'] >= datetime.now() - timedelta(days=30)
        ]
    elif date_range == 'week':
        filtered_transactions = filtered_transactions[
            filtered_transactions['Date'] >= datetime.now() - timedelta(days=7)
        ]
    
    # Apply category filter
    if filter_category != 'All':
        filtered_transactions = filtered_transactions[filtered_transactions['Category'] == filter_category]
    
    # Apply sorting
    filtered_transactions = filtered_transactions.sort_values(by=sort_by, ascending=False)
    
    return render_template('view_transactions.html',
                         transactions=filtered_transactions.to_dict('records'),
                         categories=categories,
                         current_category=filter_category,
                         current_date_range=date_range,
                         sort_by=sort_by)

@app.route('/expense_analysis')
def expense_analysis():
    if transactions.empty:
        flash('No transactions available for analysis.', 'info')
        return render_template('expense_analysis.html')
    
    # Prepare data for charts
    expenses = transactions[transactions['Type'] == 'Expense']
    expense_by_category = expenses.groupby('Category')['Amount'].sum()
    
    # Create pie chart
    fig_pie = px.pie(
        values=expense_by_category.values,
        names=expense_by_category.index,
        title='Expenses by Category'
    )
    
    # Create time series chart
    monthly_expenses = expenses.set_index('Date').resample('M')['Amount'].sum()
    fig_line = px.line(
        x=monthly_expenses.index,
        y=monthly_expenses.values,
        title='Monthly Expenses Over Time'
    )
    
    # Convert charts to JSON for rendering
    charts = {
        'pie': json.dumps(fig_pie, cls=plotly.utils.PlotlyJSONEncoder),
        'line': json.dumps(fig_line, cls=plotly.utils.PlotlyJSONEncoder)
    }
    
    return render_template('expense_analysis.html',
                         charts=charts,
                         expense_data=expense_by_category.to_dict())

@app.route('/income_analysis')
def income_analysis():
    if transactions.empty:
        flash('No transactions available for analysis.', 'info')
        return render_template('income_analysis.html')
    
    income = transactions[transactions['Type'] == 'Income']
    income_by_category = income.groupby('Category')['Amount'].sum()
    
    # Create charts similar to expense_analysis
    fig_pie = px.pie(
        values=income_by_category.values,
        names=income_by_category.index,
        title='Income by Category'
    )
    
    monthly_income = income.set_index('Date').resample('M')['Amount'].sum()
    fig_line = px.line(
        x=monthly_income.index,
        y=monthly_income.values,
        title='Monthly Income Over Time'
    )
    
    charts = {
        'pie': json.dumps(fig_pie, cls=plotly.utils.PlotlyJSONEncoder),
        'line': json.dumps(fig_line, cls=plotly.utils.PlotlyJSONEncoder)
    }
    
    return render_template('income_analysis.html',
                         charts=charts,
                         income_data=income_by_category.to_dict())

@app.route('/set_budget_goals', methods=['GET', 'POST'])
def set_budget_goals():
    if request.method == 'POST':
        try:
            category = request.form['category']
            amount = float(request.form['amount'])
            budget_goals[category] = amount
            save_data()
            flash(f'Budget goal for {category} set to ${amount:.2f}', 'success')
        except Exception as e:
            flash(f'Error setting budget goal: {str(e)}', 'error')
    
    return render_template('budget_goals.html',
                         categories=categories,
                         budget_goals=budget_goals)

@app.route('/manage_categories', methods=['GET', 'POST'])
def manage_categories():
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'add':
            new_category = request.form.get('new_category')
            if new_category and new_category not in categories:
                categories.append(new_category)
                save_data()
                flash(f'Category "{new_category}" added successfully!', 'success')
            else:
                flash('Category already exists or is invalid!', 'error')
                
        elif action == 'delete':
            category_to_delete = request.form.get('category')
            if category_to_delete in categories:
                if not transactions.empty and category_to_delete in transactions['Category'].values:
                    flash('Cannot delete category that is in use!', 'error')
                else:
                    categories.remove(category_to_delete)
                    if category_to_delete in budget_goals:
                        del budget_goals[category_to_delete]
                    save_data()
                    flash(f'Category "{category_to_delete}" deleted successfully!', 'success')
    
    return render_template('manage_categories.html', categories=categories)

@app.route('/account_settings')
def account_settings():
    return render_template('account_settings.html')

@app.route('/reset_data', methods=['POST'])
def reset_data():
    global transactions, budget_goals
    try:
        transactions = pd.DataFrame(columns=["Date", "Type", "Category", "Amount", "Description"])
        budget_goals = {}
        save_data()
        flash('All data has been reset!', 'success')
    except Exception as e:
        flash(f'Error resetting data: {str(e)}', 'error')
    return redirect(url_for('home'))

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    if not os.path.exists('data'):
        os.makedirs('data')
    
    # Load existing data when starting the application
    load_data()
    
    # Run the application
    app.run(debug=True)
