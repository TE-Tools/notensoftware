import streamlit as st
import sqlite3
import json

# --- DATENBANK SETUP ---
def init_db():
    conn = sqlite3.connect('orchester_umfrage.db')
    c = conn.cursor()
    # Tabelle für die Fragen
    c.execute('''CREATE TABLE IF NOT EXISTS questions 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, type TEXT, options TEXT, allow_free TEXT)''')
    # Tabelle für die Stimmen (verhindert doppelte Abstimmung via Name)
    c.execute('''CREATE TABLE IF NOT EXISTS votes 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, answers TEXT)''')
    conn.commit()
    conn.close()

init_db()

def get_db():
    return sqlite3.connect('orchester_umfrage.db')

# --- APPLIKATION ---
st.set_page_config(page_title="Blasorchester Umfrage", page_icon="🎺", layout="centered")
st.title("🎺 Blasorchester Umfrage-Tool")

# Sidebar für Admin-Bereich
is_admin = st.sidebar.checkbox("Admin-Oberfläche anzeigen")

if is_admin:
    st.header("⚙️ Admin-Bereich: Fragen verwalten")
    
    with st.form("new_question_form", clear_on_submit=True):
        new_q = st.text_input("Fragetext:")
        q_type = select_type = st.selectbox("Antwort-Typ:", ["Einzelantwort (Radio)", "Mehrfachantwort (Checkbox)"])
        options_input = st.text_area("Antwortoptionen (Eine Option pro Zeile):")
        allow_free = st.checkbox("Zusätzliches Freitextfeld für diese Frage erlauben?")
        submit_q = st.form_submit_button("Frage hinzufügen")
        
        if submit_q and new_q:
            options_list = [opt.strip() for opt in options_input.split("\n") if opt.strip()]
            conn = get_db()
            c = conn.cursor()
            c.execute("INSERT INTO questions (question, type, options, allow_free) VALUES (?, ?, ?, ?)",
                      (new_q, q_type, json.dumps(options_list), "Ja" if allow_free else "Nein"))
            conn.commit()
            conn.close()
            st.success("Frage erfolgreich hinzugefügt!")

    # Bestehende Fragen und Ergebnisse anzeigen
    st.subheader("Aktuelle Fragen & Ergebnisse")
    conn = get_db()
    c = conn.cursor()
    questions = c.execute("SELECT * FROM questions").fetchall()
    votes = c.execute("SELECT answers FROM votes").fetchall()
    conn.close()
    
    if not questions:
        st.info("Noch keine Fragen erstellt.")
    for q in questions:
        st.markdown(f"**Frage {q[0]}: {q[1]}** ({q[2]})")
        
        # Einfache Stimmenauszählung für diese Frage
        votes_count = {}
        free_texts = []
        for v in votes:
            user_answers = json.loads(v[0])
            if str(q[0]) in user_answers:
                ans_data = user_answers[str(q[0])]
                # Gewählte Optionen zählen
                opts = ans_data.get('choices', [])
                if isinstance(opts, list):
                    for o in opts: votes_count[o] = votes_count.get(o, 0) + 1
                elif opts:
                    votes_count[opts] = votes_count.get(opts, 0) + 1
                # Freitext sammeln
                if ans_data.get('free_text'):
                    free_texts.append(ans_data['free_text'])
        
        if votes_count:
            st.write("Ergebnisse:", votes_count)
        if free_texts:
            st.write("Freitexte / Anmerkungen:", free_texts)
        st.write("---")

else:
    # --- MUSIKER ANSICHT ---
    st.header("📋 Aktuelle Umfrage")
    
    conn = get_db()
    c = conn.cursor()
    questions = c.execute("SELECT * FROM questions").fetchall()
    conn.close()
    
    if not questions:
        st.warning("Aktuell gibt es keine aktiven Fragen. Bitte den Admin, Fragen hinzuzufügen.")
    else:
        with st.form("survey_form"):
            user_name = st.text_input("Dein vollständiger Name (Vor- und Nachname):", placeholder="z.B. Maria Müller")
            st.write("---")
            
            responses = {}
            for q in questions:
                q_id, q_text, q_type, q_options, q_free = q
                options = json.loads(q_options)
                
                st.markdown(f"#### {q_text}")
                
                # Antwort-Typen weisen
                if "Einzelantwort" in q_type:
                    choice = st.radio("Wähle eine Option:", options, key=f"q_{q_id}")
                    responses[q_id] = {"choices": choice}
                else:
                    choices = []
                    st.write("Wähle alle passenden Optionen:")
                    for opt in options:
                        if st.checkbox(opt, key=f"q_{q_id}_{opt}"):
                            choices.append(opt)
                    responses[q_id] = {"choices": choices}
                
                # Freitext falls aktiviert
                if q_free == "Ja":
                    f_text = st.text_input("Zusätzliche Anmerkung (optional):", key=f"free_{q_id}")
                    responses[q_id]["free_text"] = f_text
                
                st.write("---")
                
            submit_survey = st.form_submit_button("Abstimmung abschicken")
            
            if submit_survey:
                if not user_name.strip():
                    st.error("Bitte gib deinen Namen ein, um abzustimmen!")
                else:
                    # Prüfen, ob der Name schon existiert
                    conn = get_db()
                    c = conn.cursor()
                    already_voted = c.execute("SELECT id FROM votes WHERE LOWER(name) = LOWER(?)", (user_name.strip(),)).fetchone()
                    
                    if already_voted:
                        st.error(f"Unter dem Namen '{user_name}' wurde bereits abgestimmt! Jeder darf nur einmal teilnehmen.")
                        conn.close()
                    else:
                        c.execute("INSERT INTO votes (name, answers) VALUES (?, ?)", (user_name.strip(), json.dumps(responses)))
                        conn.commit()
                        conn.close()
                        st.success("Vielen Dank! Deine Stimme wurde gezählt.")