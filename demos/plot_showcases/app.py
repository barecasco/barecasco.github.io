import dash
from dash import dcc, html, Input, Output, callback
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import pandas as pd
from plotly.subplots import make_subplots

# Initialize the Dash app
app = dash.Dash(__name__, suppress_callback_exceptions=True)

# Define the app layout
app.layout = html.Div([
    html.H1("Plotly visualization showcase", style={"textAlign": "center", "marginBottom": "30px"}),
    
    html.Div([
        html.Label("select plot type:"),
        dcc.Dropdown(
            id="plot-type-dropdown",
            options=[
                {"label": "Basic Charts", "value": "basic"},
                {"label": "Statistical Charts", "value": "statistical"},
                {"label": "Scientific Charts", "value": "scientific"},
                {"label": "Financial Charts", "value": "financial"},
                {"label": "Maps & 3D", "value": "maps_3d"},
                {"label": "Other Specialized Charts", "value": "specialized"}
            ],
            value="basic",
            clearable=False,
            style={'marginTop': '15px'}
        ),
    ], style={"width": "300px", "margin": "0 auto", "marginBottom": "20px"}),
    
    html.Div([
        html.Label("select specific plot:", style={"marginBottom": "10px"}),
        dcc.Dropdown(id="specific-plot-dropdown", clearable=False, style={'marginTop': '15px'}),
    ], style={"width": "300px", "margin": "0 auto", "marginBottom": "30px"}),
    
    dcc.Graph(id="plot-display", style={"height": "600px"}),
    
    html.Div(id="plot-description", style={"margin": "30px", "padding": "15px", "border": "1px solid #ddd", "borderRadius": "5px"})
], style={"fontFamily": "Arial, sans-serif", "maxWidth": "1200px", "margin": "0 auto", "padding": "20px"})

# Callback to update specific plot options based on plot type
@callback(
    Output("specific-plot-dropdown", "options"),
    Output("specific-plot-dropdown", "value"),
    Input("plot-type-dropdown", "value")
)
def update_specific_plots(plot_type):
    if plot_type == "basic":
        options = [
            {"label": "Line Plot", "value": "line"},
            {"label": "Bar Chart", "value": "bar"},
            {"label": "Scatter Plot", "value": "scatter"},
            {"label": "Pie Chart", "value": "pie"},
            {"label": "Area Chart", "value": "area"},
            {"label": "Bubble Chart", "value": "bubble"},
        ]
        default = "line"
    elif plot_type == "statistical":
        options = [
            {"label": "Box Plot", "value": "box"},
            {"label": "Violin Plot", "value": "violin"},
            {"label": "Histogram", "value": "histogram"},
            {"label": "ECDF", "value": "ecdf"},
            {"label": "Heatmap", "value": "heatmap"},
            {"label": "Contour Plot", "value": "contour"},
        ]
        default = "box"
    elif plot_type == "scientific":
        options = [
            {"label": "Polar Chart", "value": "polar"},
            {"label": "Scattergl (Large Dataset)", "value": "scattergl"},
            {"label": "Error Bars", "value": "error_bars"},
            {"label": "Function Plot", "value": "function"},
            {"label": "Filled Area Plot", "value": "filled_area"},
        ]
        default = "polar"
    elif plot_type == "financial":
        options = [
            {"label": "Candlestick Chart", "value": "candlestick"},
            {"label": "OHLC Chart", "value": "ohlc"},
            {"label": "Time Series", "value": "time_series"},
            {"label": "Waterfall Chart", "value": "waterfall"},
            {"label": "Funnel Chart", "value": "funnel"},
        ]
        default = "candlestick"
    elif plot_type == "maps_3d":
        options = [
            {"label": "3D Surface Plot", "value": "surface"},
            {"label": "3D Scatter Plot", "value": "scatter3d"},
            {"label": "3D Line Plot", "value": "line3d"},
            {"label": "Choropleth Map", "value": "choropleth"},
            {"label": "Mapbox Scatter", "value": "mapbox"},
        ]
        default = "surface"
    else:  # specialized
        options = [
            {"label": "Radar/Spider Chart", "value": "radar"},
            {"label": "Treemap", "value": "treemap"},
            {"label": "Sunburst Chart", "value": "sunburst"},
            {"label": "Parallel Coordinates", "value": "parallel"},
            {"label": "Sankey Diagram", "value": "sankey"},
            {"label": "Gauge Chart", "value": "gauge"},
        ]
        default = "radar"
    
    return options, default

# Generate sample data for plots
def generate_sample_data(plot_type, specific_plot):
    # Basic data for most plots
    np.random.seed(42)
    x = np.linspace(0, 10, 100)
    y = np.sin(x) + np.random.normal(0, 0.2, 100)
    categories = ['A', 'B', 'C', 'D', 'E', 'F']
    values = np.random.randint(10, 100, len(categories))
    
    # For categorical data
    df_cat = pd.DataFrame({
        'category': categories,
        'value': values,
        'value2': np.random.randint(10, 100, len(categories)),
        'group': np.random.choice(['Group 1', 'Group 2'], len(categories))
    })
    
    # For time series
    dates = pd.date_range('2023-01-01', periods=30)
    df_time = pd.DataFrame({
        'date': dates,
        'value': np.cumsum(np.random.normal(0, 1, 30))
    })
    
    # For 3D data
    x_3d = np.linspace(-5, 5, 20)
    y_3d = np.linspace(-5, 5, 20)
    X, Y = np.meshgrid(x_3d, y_3d)
    Z = np.sin(np.sqrt(X**2 + Y**2))
    
    # For financial data
    dates_fin = pd.date_range('2023-01-01', periods=30)
    df_ohlc = pd.DataFrame({
        'date': dates_fin,
        'open': np.random.normal(100, 5, 30),
        'high': None,
        'low': None,
        'close': None
    })
    for i in range(len(df_ohlc)):
        df_ohlc.loc[i, 'close'] = df_ohlc.loc[i, 'open'] + np.random.normal(0, 3)
        df_ohlc.loc[i, 'high'] = max(df_ohlc.loc[i, 'open'], df_ohlc.loc[i, 'close']) + np.random.uniform(0.5, 3)
        df_ohlc.loc[i, 'low'] = min(df_ohlc.loc[i, 'open'], df_ohlc.loc[i, 'close']) - np.random.uniform(0.5, 3)
    
    return {
        'x': x,
        'y': y,
        'categories': categories,
        'values': values,
        'df_cat': df_cat,
        'df_time': df_time,
        'X': X,
        'Y': Y,
        'Z': Z,
        'df_ohlc': df_ohlc
    }

# Callback to update the plot based on selection
@callback(
    Output("plot-display", "figure"),
    Output("plot-description", "children"),
    Input("plot-type-dropdown", "value"),
    Input("specific-plot-dropdown", "value")
)
def update_plot(plot_type, specific_plot):
    # Get sample data
    data = generate_sample_data(plot_type, specific_plot)
    
    # Create figure based on selection
    fig = go.Figure()
    description = ""
    
    # ==== BASIC CHARTS ====
    if specific_plot == "line":
        fig = px.line(x=data['x'], y=data['y'], title="Line Plot")
        description = "Line plots connect data points with straight lines, ideal for showing trends over continuous data like time series."
    
    elif specific_plot == "bar":
        fig = px.bar(data['df_cat'], x='category', y='value', color='group', barmode='group', title="Grouped Bar Chart")
        description = "Bar charts display categorical data with rectangular bars proportional to the values they represent."
    
    elif specific_plot == "scatter":
        # Generate some correlated data
        corr_x = np.random.normal(0, 1, 100)
        corr_y = corr_x * 0.8 + np.random.normal(0, 0.5, 100)
        size = np.random.randint(5, 15, 100)
        df = pd.DataFrame({'x': corr_x, 'y': corr_y, 'size': size, 'category': np.random.choice(['A', 'B', 'C'], 100)})
        fig = px.scatter(df, x='x', y='y', color='category', size='size', title="Scatter Plot")
        description = "Scatter plots show the relationship between two variables as points, often revealing correlations and patterns."
    
    elif specific_plot == "pie":
        fig = px.pie(data['df_cat'], values='value', names='category', title="Pie Chart")
        description = "Pie charts represent parts of a whole, with each slice proportional to the quantity it represents."
    
    elif specific_plot == "area":
        # Create stacked area chart
        df_area = pd.DataFrame({
            'x': np.arange(10),
            'y1': np.random.randint(1, 10, 10),
            'y2': np.random.randint(1, 10, 10),
            'y3': np.random.randint(1, 10, 10)
        })
        fig = px.area(df_area, x='x', y=['y1', 'y2', 'y3'], title="Stacked Area Chart")
        description = "Area charts are similar to line charts but with the area below the line filled, useful for showing volume and composition over time."
    
    elif specific_plot == "bubble":
        # Generate bubble chart data
        df_bubble = pd.DataFrame({
            'x': np.random.normal(0, 1, 20),
            'y': np.random.normal(0, 1, 20),
            'size': np.random.randint(5, 50, 20),
            'category': np.random.choice(['Group A', 'Group B', 'Group C'], 20)
        })
        fig = px.scatter(df_bubble, x='x', y='y', size='size', color='category', title="Bubble Chart")
        description = "Bubble charts are scatter plots where points have a third dimension represented by their size."
    
    # ==== STATISTICAL CHARTS ====
    elif specific_plot == "box":
        # Generate random data for different groups
        df_box = pd.DataFrame({
            'group': np.repeat(['A', 'B', 'C', 'D'], 25),
            'value': np.concatenate([
                np.random.normal(0, 1, 25),
                np.random.normal(2, 1.5, 25),
                np.random.normal(-1, 2, 25),
                np.random.normal(3, 0.5, 25)
            ])
        })
        fig = px.box(df_box, x='group', y='value', notched=True, title="Box Plot")
        description = "Box plots display distribution of data based on a five-number summary: minimum, first quartile, median, third quartile, and maximum."
    
    elif specific_plot == "violin":
        # Use the same data as box plot
        df_box = pd.DataFrame({
            'group': np.repeat(['A', 'B', 'C', 'D'], 25),
            'value': np.concatenate([
                np.random.normal(0, 1, 25),
                np.random.normal(2, 1.5, 25),
                np.random.normal(-1, 2, 25),
                np.random.normal(3, 0.5, 25)
            ])
        })
        fig = px.violin(df_box, x='group', y='value', box=True, points="all", title="Violin Plot")
        description = "Violin plots combine box plots with kernel density estimates, showing the distribution shape of the data."
    
    elif specific_plot == "histogram":
        # Generate some random data with multiple modes
        multi_modal = np.concatenate([
            np.random.normal(-3, 1, 200),
            np.random.normal(0, 0.5, 300),
            np.random.normal(3, 1, 200)
        ])
        fig = px.histogram(x=multi_modal, nbins=30, marginal="box", title="Histogram with Box Plot")
        description = "Histograms represent the distribution of numerical data by splitting it into bins and showing the frequency of each bin."
    
    elif specific_plot == "ecdf":
        # Generate some random data
        normal_data = np.random.normal(0, 1, 200)
        fig = px.ecdf(normal_data, title="Empirical Cumulative Distribution Function")
        description = "ECDF (Empirical Cumulative Distribution Function) plots show the proportion of observations less than or equal to each value."
    
    elif specific_plot == "heatmap":
        # Generate correlation matrix
        n = 10
        corr_matrix = np.eye(n)  # Start with identity matrix
        for i in range(n):
            for j in range(i+1, n):
                val = np.random.uniform(-0.9, 0.9)
                corr_matrix[i, j] = val
                corr_matrix[j, i] = val  # Make it symmetric
        
        labels = [f"Var {i+1}" for i in range(n)]
        fig = px.imshow(corr_matrix, x=labels, y=labels, color_continuous_scale="RdBu_r",
                      title="Correlation Heatmap")
        description = "Heatmaps visualize matrix data where values are represented by colors, useful for correlation matrices or any tabular data."
    
    elif specific_plot == "contour":
        # Use the 3D data
        X, Y = data['X'], data['Y']
        Z = data['Z']
        fig = px.density_contour(x=X[0], y=Y[:, 0], z=Z, title="Contour Plot")
        description = "Contour plots show 3D surfaces on a 2D plane using contour lines of equal values, like topographic maps."
    
    # ==== SCIENTIFIC CHARTS ====
    elif specific_plot == "polar":
        # Generate data for polar plot
        theta = np.linspace(0, 2*np.pi, 100)
        r1 = np.abs(np.sin(theta*4)) + 0.5
        r2 = np.abs(np.cos(theta*4)) + 0.5
        df_polar = pd.DataFrame({
            'theta': np.concatenate([theta, theta]),
            'r': np.concatenate([r1, r2]),
            'group': np.concatenate([['A']*100, ['B']*100])
        })
        fig = px.line_polar(df_polar, r='r', theta='theta', color='group', line_close=True,
                           title="Polar Chart")
        description = "Polar charts display data in a circular format, with values plotted based on angle and distance from the center."
    
    elif specific_plot == "scattergl":
        # Generate large dataset
        n = 10000
        df_large = pd.DataFrame({
            'x': np.random.normal(0, 1, n),
            'y': np.random.normal(0, 1, n),
            'group': np.random.choice(['A', 'B', 'C'], n)
        })
        fig = px.scatter(df_large, x='x', y='y', color='group', render_mode='webgl',
                       opacity=0.7, title="ScatterGL (10,000 points)")
        description = "ScatterGL uses WebGL rendering for efficiently plotting large datasets of up to millions of points."
    
    elif specific_plot == "error_bars":
        x = np.arange(10)
        y = np.random.normal(10, 2, 10).cumsum()
        error_y = np.random.uniform(0.5, 2, 10)
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=x, y=y,
            error_y=dict(type='data', array=error_y, visible=True),
            mode='markers+lines',
            name='Data with Error Bars'
        ))
        fig.update_layout(title="Error Bar Plot")
        description = "Error bars display the variability or uncertainty in measurements, commonly used in scientific and statistical visualizations."
    
    elif specific_plot == "function":
        x = np.linspace(-5, 5, 100)
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=x, y=np.sin(x), mode='lines', name='sin(x)'))
        fig.add_trace(go.Scatter(x=x, y=np.cos(x), mode='lines', name='cos(x)'))
        fig.add_trace(go.Scatter(x=x, y=np.sin(x)*np.cos(x), mode='lines', name='sin(x)*cos(x)'))
        
        fig.update_layout(title="Function Plots")
        description = "Function plots visualize mathematical functions by plotting their outputs across a range of input values."
    
    elif specific_plot == "filled_area":
        x = np.linspace(0, 10, 100)
        y1 = np.sin(x)
        y2 = np.cos(x)
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=x, y=y1,
            fill=None,
            mode='lines',
            line_color='blue',
            name='sin(x)'
        ))
        fig.add_trace(go.Scatter(
            x=x, y=y2,
            fill='tonexty',  # Fill to trace0 y
            mode='lines',
            line_color='red',
            name='cos(x)'
        ))
        fig.update_layout(title="Filled Area Between Curves")
        description = "Filled area plots highlight the region between two curves, useful for showing differences or ranges between functions."
    
    # ==== FINANCIAL CHARTS ====
    elif specific_plot == "candlestick":
        df = data['df_ohlc']
        fig = go.Figure(data=[go.Candlestick(
            x=df['date'],
            open=df['open'],
            high=df['high'],
            low=df['low'],
            close=df['close']
        )])
        fig.update_layout(title="Candlestick Chart", xaxis_rangeslider_visible=False)
        description = "Candlestick charts display price movements of a security, commodity, or currency with each candlestick showing open, high, low, and close values."
    
    elif specific_plot == "ohlc":
        df = data['df_ohlc']
        fig = go.Figure(data=[go.Ohlc(
            x=df['date'],
            open=df['open'],
            high=df['high'],
            low=df['low'],
            close=df['close']
        )])
        fig.update_layout(title="OHLC Chart", xaxis_rangeslider_visible=False)
        description = "OHLC (Open-High-Low-Close) charts show price movement similar to candlestick charts but with a different visual representation."
    
    elif specific_plot == "time_series":
        df = data['df_time']
        fig = px.line(df, x='date', y='value', title="Time Series Chart")
        fig.update_xaxes(rangeslider_visible=True)
        description = "Time series charts display data points indexed in time order, often used to show how data changes over time."
    
    elif specific_plot == "waterfall":
        measures = ["relative", "relative", "relative", "relative", "total", "relative", "relative", "relative", "total"]
        labels = ["Sales", "Cost of Sales", "Gross Profit", "Operating Expenses", "EBITDA", "Depreciation", "Interest", "Tax", "Net Income"]
        values = [500, -300, None, -100, None, -50, -30, -20, None]
        
        fig = go.Figure(go.Waterfall(
            measure=measures,
            x=labels,
            y=values,
            connector={"line": {"color": "rgb(63, 63, 63)"}},
            increasing={"marker": {"color": "green"}},
            decreasing={"marker": {"color": "red"}},
            totals={"marker": {"color": "blue"}}
        ))
        fig.update_layout(title="Waterfall Chart")
        description = "Waterfall charts show how an initial value is affected by intermediate positive or negative values, leading to a final value."
    
    elif specific_plot == "funnel":
        stages = ['Website Visits', 'Downloads', 'Prospects', 'Demos', 'Proposals', 'Negotiations', 'Closed Deals']
        values = [5200, 2800, 1500, 950, 600, 400, 250]
        
        fig = go.Figure(go.Funnel(
            y=stages,
            x=values,
            textinfo="value+percent initial"
        ))
        fig.update_layout(title="Funnel Chart")
        description = "Funnel charts visualize stages in a process, showing decreasing values as items progress through each stage."
    
    # ==== MAPS & 3D ====
    elif specific_plot == "surface":
        X, Y = data['X'], data['Y']
        Z = data['Z']
        
        fig = go.Figure(data=[go.Surface(z=Z, x=X, y=Y)])
        fig.update_layout(title="3D Surface Plot", autosize=False, scene=dict(
            xaxis_title="X Axis",
            yaxis_title="Y Axis",
            zaxis_title="Z Axis"
        ))
        description = "3D surface plots represent a functional relationship as a surface in three dimensions."
    
    elif specific_plot == "scatter3d":
        n = 100
        df_3d = pd.DataFrame({
            'x': np.random.normal(0, 1, n),
            'y': np.random.normal(0, 1, n),
            'z': np.random.normal(0, 1, n),
            'size': np.random.uniform(5, 15, n),
            'color': np.random.normal(0, 1, n)
        })
        
        fig = px.scatter_3d(df_3d, x='x', y='y', z='z', 
                          color='color', size='size',
                          title="3D Scatter Plot")
        description = "3D scatter plots show the relationship between three variables in a three-dimensional space."
    
    elif specific_plot == "line3d":
        t = np.linspace(0, 10*np.pi, 500)
        x = np.sin(t)
        y = np.cos(t)
        z = t/10
        
        fig = go.Figure(data=[go.Scatter3d(
            x=x, y=y, z=z,
            mode='lines',
            line=dict(width=5, color=z, colorscale='Viridis')
        )])
        fig.update_layout(title="3D Line Plot")
        description = "3D line plots connect points in three-dimensional space, useful for visualizing trajectories or parametric curves."
    
    elif specific_plot == "choropleth":
        # Simple world map with random data
        df_map = pd.DataFrame({
            'country': ['USA', 'Canada', 'Mexico', 'Brazil', 'UK', 'France', 'Germany', 
                        'Italy', 'Russia', 'China', 'India', 'Japan', 'Australia'],
            'value': np.random.uniform(0, 100, 13)
        })
        
        fig = px.choropleth(df_map, locations='country', locationmode='country names',
                          color='value', title="Choropleth Map",
                          color_continuous_scale=px.colors.sequential.Plasma)
        description = "Choropleth maps use color to represent statistical values across geographic regions."
    
    elif specific_plot == "mapbox":
        # Sample cities with random data
        cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 
                 'San Antonio', 'San Diego', 'Dallas', 'San Jose']
        lats = [40.7128, 34.0522, 41.8781, 29.7604, 33.4484, 39.9526, 29.4241, 32.7157, 32.7767, 37.3382]
        lons = [-74.0060, -118.2437, -87.6298, -95.3698, -112.0740, -75.1652, -98.4936, -117.1611, -96.7970, -121.8863]
        values = np.random.randint(10, 100, len(cities))
        
        df_city = pd.DataFrame({
            'city': cities,
            'lat': lats,
            'lon': lons,
            'value': values
        })
        
        fig = px.scatter_mapbox(df_city, lat='lat', lon='lon', color='value', size='value',
                              text='city', zoom=3, height=600,
                              mapbox_style="carto-positron",
                              title="Mapbox Scatter Plot")
        description = "Mapbox scatter plots place points on a detailed interactive map, allowing for location-based data visualization."
    
    # ==== SPECIALIZED CHARTS ====
    elif specific_plot == "radar":
        categories = ['Sales', 'Marketing', 'Development', 'Customer Support', 'HR', 'IT', 'Finance']
        company1 = [80, 65, 90, 70, 60, 85, 75]
        company2 = [70, 80, 75, 85, 75, 70, 65]
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatterpolar(
            r=company1,
            theta=categories,
            fill='toself',
            name='Company A'
        ))
        
        fig.add_trace(go.Scatterpolar(
            r=company2,
            theta=categories,
            fill='toself',
            name='Company B'
        ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 100]
                )
            ),
            title="Radar/Spider Chart"
        )
        description = "Radar or spider charts display multivariate data in a circular format, with each variable on an axis from the center."
    
    elif specific_plot == "treemap":
        df_treemap = pd.DataFrame({
            'names': ['A', 'B', 'C', 'A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'C3'],
            'parents': ['', '', '', 'A', 'A', 'A', 'B', 'B', 'C', 'C', 'C'],
            'values': [10, 15, 20, 3, 3, 4, 7, 8, 6, 7, 7]
        })
        
        fig = px.treemap(df_treemap, path=['parents', 'names'], values='values',
                       title="Treemap")
        description = "Treemaps display hierarchical data as nested rectangles, with the area proportional to the value of each category."
    
    elif specific_plot == "sunburst":
        # Use the same data as treemap
        df_treemap = pd.DataFrame({
            'names': ['A', 'B', 'C', 'A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'C3'],
            'parents': ['', '', '', 'A', 'A', 'A', 'B', 'B', 'C', 'C', 'C'],
            'values': [10, 15, 20, 3, 3, 4, 7, 8, 6, 7, 7]
        })
        
        fig = px.sunburst(df_treemap, path=['parents', 'names'], values='values',
                         title="Sunburst Chart")
        description = "Sunburst charts display hierarchical data as a series of concentric rings, with each ring representing a level in the hierarchy."
    
    elif specific_plot == "parallel":
        # Generate data for parallel coordinates
        n = 30
        df_parallel = pd.DataFrame({
            'id': range(n),
            'feature1': np.random.normal(0, 1, n),
            'feature2': np.random.normal(1, 2, n),
            'feature3': np.random.normal(2, 1.5, n),
            'feature4': np.random.normal(-1, 1, n),
            'feature5': np.random.normal(0.5, 0.5, n),
            'category': np.random.choice(['A', 'B', 'C'], n)
        })
        
        fig = px.parallel_coordinates(df_parallel, color="category",
                                    dimensions=['feature1', 'feature2', 'feature3', 'feature4', 'feature5'],
                                    title="Parallel Coordinates Plot")
        description = "Parallel coordinates plots visualize multi-dimensional data, with each vertical line representing a dimension and each connected line representing an observation."
    
    elif specific_plot == "sankey":
        # Create Sankey diagram data
        labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        source = [0, 0, 1, 1, 2, 2, 3, 5]
        target = [2, 3, 4, 5, 6, 7, 7, 6]
        values = [10, 15, 20, 25, 10, 5, 15, 5]
        
        fig = go.Figure(data=[go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color="black", width=0.5),
                label=labels
            ),
            link=dict(
                source=source,
                target=target,
                value=values
            )
        )])
        fig.update_layout(title="Sankey Diagram")
        description = "Sankey diagrams visualize flow between nodes in a network, with the width of links representing the flow quantity."
    
    elif specific_plot == "gauge":
        # Create gauge chart
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=75,
            title={'text': "Performance Score"},
            gauge={
                'axis': {'range': [None, 100]},
                'bar': {'color': "darkblue"},
                'steps': [
                    {'range': [0, 50], 'color': "lightgray"},
                    {'range': [50, 75], 'color': "gray"}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 90
                }
            }
        ))
        fig.update_layout(title="Gauge Chart")
        description = "Gauge charts display a single value within a range, often used for key performance indicators or metrics."
    
    # Add more styling to the figure
    fig.update_layout(
        template="plotly_white",
        margin=dict(l=20, r=20, t=50, b=20),
    )
    
    return fig, html.Div([
        html.H3("About this Plot"),
        html.P(description),
        html.Hr(),
        html.P("This is part of a Plotly visualization showcase demonstrating various plot types available in Plotly.")
    ])

if __name__ == '__main__':
    app.run(debug=True)