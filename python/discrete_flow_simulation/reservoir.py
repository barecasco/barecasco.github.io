import cls_agent


agent       = None
integrator  = None
name        = "reservoir"


prop    = {
    "stock"             : 0,
    "capacity"          : 10e7,
    "total_outflow"     : 0,
    "delivery_source"   : None
}


def init(integrator):
    agent   = cls_agent.Agent(integrator, name)
    



