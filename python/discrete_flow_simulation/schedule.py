from datetime import datetime, timedelta
import numpy as np


prop       = None   # containing properties
integrator = None   # the integrator for all classes
schedule_dict   = {}     # containing the human readable schedule
deliveries      = []     # containing the schedule objects
current_delivery_id = None


prop    = {
    "analysis_run_time" : 60 * 60 * 10,
    "delivery_rate" : 250.0
}


schedule_dict = {
    "2024/04/08 01:00:00   3600",
    "2024/04/12 01:00:00   2000",
    "2024/04/15 01:00:00   3800",
    "2024/04/20 01:00:00   4000",
    "2024/04/27 01:00:00   3600"
}


for line in schedule_dict:
    # cline      = line.replace("\n", "")
    sched = line.split("   ")

    transport_start  = datetime.strptime(sched[0], "%Y/%m/%d %H:%M:%S")
    analysis_end     = transport_start
    analysis_start   = analysis_end - timedelta(seconds=prop["analysis_run_time"])
    target_volume    = int(sched[1])
    transport_end    = transport_start + timedelta(seconds = int(3600*target_volume/prop["delivery_rate"]))

    deliveries.append({
        "transport_start"   : transport_start,
        "transport_end"     : transport_end,
        "analysis_start"    : analysis_start,
        "analysis_end"      : analysis_end,
        "target_volume"     : target_volume,
        "delivery_id"       : sched[0],
        "volume_delivered"  : 0.0,
        "is_done"           : False,
        "porter"            : None
    })


def init(integrator_inp):
    global integrator
    integrator = integrator_inp



def is_in_analysis():
    global integrator, deliveries, current_delivery_id
    test_date = integrator.get_date_time()
    for sched in deliveries:
        if np.logical_and(test_date > sched['analysis_start'], test_date < sched['analysis_end']):
            current_delivery_id = sched["delivery_id"]
            return True
    return False


def is_in_schedule():
    global integrator, deliveries
    test_date = integrator.get_date_time()
    for sched in deliveries:
        if np.logical_and(test_date > sched['transport_start'], test_date < sched['transport_end']):
            return True
    return False        


def set_current_transport_end(input_rate):
    global current_delivery_id
    for delv in deliveries:
        if delv["delivery_id"] == current_delivery_id:
            transport_start = delv["transport_start"]
            target_volume   = delv["target_volume"]
            delv["transport_end"] = transport_start + timedelta(seconds = int(3600*target_volume/input_rate))

