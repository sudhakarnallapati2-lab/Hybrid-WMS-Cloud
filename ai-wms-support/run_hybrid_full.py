import os, json, datetime, random
from pathlib import Path

def ensure_out():
    Path("out").mkdir(exist_ok=True)

def now_iso():
    return datetime.datetime.now().isoformat()

OU_MAP = {"India_OU":"EBS","US_OU":"SAAS","EU_OU":"SAAS"}

def simulate():
    rows=[]
    run_time=now_iso()
    for ou, backend in OU_MAP.items():
        if backend=="EBS":
            stuck=random.randint(0,3); waves=random.randint(0,2); cloud=fusion=0
        else:
            cloud=random.randint(0,3); fusion=random.randint(0,2); stuck=waves=0
        total=stuck+waves+cloud+fusion
        rows.append({
            "run_time":run_time,"ou_name":ou,"backend":backend,
            "stuck_lpn":stuck,"aging_waves":waves,
            "cloud_stuck_tasks":cloud,"fusion_exceptions":fusion,
            "total_issues":total,
            "snow_incident_id":"","snow_incident_number":""
        })
    return rows

def main():
    ensure_out()
    rows=simulate()
    with open("out/hybrid_report.json","w") as f:
        json.dump(rows,f,indent=2)
    print("Done. Saved to out/hybrid_report.json")

if __name__=="__main__":
    main()
