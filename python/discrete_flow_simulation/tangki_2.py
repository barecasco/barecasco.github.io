import cls_agent
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

agent           = None
integrator      = None
schedule        = None
deliveries      = None 
name            = "tangki_2"

prop    = {
    "stock"             : 0,
    "capacity"          : 10000,
    "hourly_rate"       : 250.0,
    "is_discharging"    : False,
    "in_analysis"       : False,
    "in_schedule"       : False,
    "target_tank"       : "null",
    "total_outflow"     : 0
}


history = {}



def in_analysis():
    return prop["in_analysis"]


def in_schedule():
    return prop["in_schedule"]


def log_state():
    global integrator, history
    history[integrator.get_date_time()] = prop.copy()
    


def get_log_history():
    df                  = pd.DataFrame(history).transpose() 
    return df


def init(integrator_inp):
    global integrator, log_state
    integrator      = integrator_inp
    agent           = cls_agent.Agent(integrator, name)
    agent.log_state = log_state





