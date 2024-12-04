from importlib import reload
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px


import cls_agent
from cls_integrator import Integrator

itg                 = Integrator()
# itg.step_horizon    = 8928      
itg.step_horizon    = 30 * 24 * 60 # 30 hari   
itg.timestep        = 60       # seconds (1 mins)

sim = cls_agent.Agent(itg, "simulator")

import kilang_1
import tangki_1
import tangki_2
import reservoir
import schedule


schedule.init(itg)
kilang_1.init(itg)
tangki_1.init(itg)
tangki_2.init(itg)
reservoir.init(itg)


tank_map = {
    kilang_1.name  : kilang_1,
    tangki_1.name  : tangki_1,
    tangki_2.name  : tangki_2,
    reservoir.name : reservoir 
}







