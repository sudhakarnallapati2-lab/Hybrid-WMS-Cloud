import streamlit as st
import pandas as pd
import json, os

st.set_page_config(page_title="Hybrid WMS Dashboard", layout="wide")

DATA_FILE="out/hybrid_report.json"
HISTORY_FILE="out/history.csv"
PASSWORD="admin123"


if "auth" not in st.session_state:
    st.session_state.auth = False

if not st.session_state.auth:
    st.title("🔐 Login")
    pwd = st.text_input("Password", type="password")

    if st.button("Login", key="login_button"):
        if pwd == PASSWORD:
            st.session_state.auth = True
            st.rerun()
        else:
            st.error("Wrong password")

    st.stop()


st.title("🚚 Hybrid WMS Dashboard")

if not os.path.exists(DATA_FILE):
    st.write("⏳ First-time setup... generating initial data.")
    import run_hybrid_full
    run_hybrid_full.main()

if not os.path.exists(DATA_FILE):
    st.warning("Run run_hybrid_full.py first.")
    st.stop()

with open(DATA_FILE) as f:
    data=json.load(f)

df=pd.DataFrame(data)
df["run_time"]=pd.to_datetime(df["run_time"])
st.subheader("Latest Run")
st.dataframe(df)

if os.path.exists(HISTORY_FILE):
    hist=pd.read_csv(HISTORY_FILE)
    hist["run_time"]=pd.to_datetime(hist["run_time"])
else:
    hist=df.copy()
    df.to_csv(HISTORY_FILE,index=False)

csv=hist.to_csv(index=False)
st.download_button("Download History CSV", csv, "history.csv","text/csv")

st.subheader("Total Issues by OU")
st.bar_chart(df.set_index("ou_name")["total_issues"])
