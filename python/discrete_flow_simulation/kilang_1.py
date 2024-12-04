import cls_agent
import pandas as pd
from datetime import datetime, timedelta

agent       = None
integrator  = None
name        = "kilang_1"


prop    = {
    "hourly_rate"       : 47.0,
    "total_outflow"     : 0,
    "outflow"           : 0,
    "stock"             : 0,
    "is_discharging"    : False,
    "target_tank"       : "null"
}

history = {}


def log_state():
    global integrator, history
    history[integrator.get_date_time()] = prop.copy()
    
    
def get_log_history():
    df                  = pd.DataFrame(history).transpose() 
    return df


def init(integrator_inp):
    global integrator, agent, log_state, name
    integrator = integrator_inp
    agent   = cls_agent.Agent(integrator, name)
    agent.log_state = log_state



