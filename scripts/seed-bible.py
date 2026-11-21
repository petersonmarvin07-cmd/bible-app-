import json
import os
import psycopg2
from psycopg2.extras import execute_values

DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/app_db")

BIBLE_METADATA = [
    # Pentateuch / Law
    {"id": 1, "osis": "Gen", "name": "Genesis", "testament": "Old", "division": "Torah / Pentateuch", "theme": "Beginnings, covenant, and the creation of all things", "summary": "From the creation of the cosmos to the foundation of the family of faith through Abraham, Isaac, Jacob, and Joseph."},
    {"id": 2, "osis": "Exod", "name": "Exodus", "testament": "Old", "division": "Torah / Pentateuch", "theme": "Deliverance, the Law, and the presence of God", "summary": "God hears the groaning of Israel in Egypt, calls Moses, parts the Red Sea, gives the Ten Commandments at Sinai, and tabernacles with His people."},
    {"id": 3, "osis": "Lev", "name": "Leviticus", "testament": "Old", "division": "Torah / Pentateuch", "theme": "Holiness, sacrifice, and worship", "summary": "Instructions for worship, offerings, priesthood, purity, and the Day of Atonement: 'Be holy, for I am holy.'"},
    {"id": 4, "osis": "Num", "name": "Numbers", "testament": "Old", "division": "Torah / Pentateuch", "theme": "Wilderness wanderings and divine faithfulness", "summary": "The journey of Israel through the wilderness, the census, rebellion and mercy, and the preparation of the new generation."},
    {"id": 5, "osis": "Deut", "name": "Deuteronomy", "testament": "Old", "division": "Torah / Pentateuch", "theme": "Covenant renewal and loving God with all the heart", "summary": "Moses' farewell sermons on the plains of Moab: remembering God's wonders, choosing life, and the Shema ('Hear, O Israel')."},
    
    # Historical
    {"id": 6, "osis": "Josh", "name": "Joshua", "testament": "Old", "division": "Historical", "theme": "Courage, conquest, and the promised land", "summary": "Joshua leads Israel across the Jordan, walls of Jericho fall, and the tribes receive their inheritance with the charge: 'Be strong and courageous.'"},
    {"id": 7, "osis": "Judg", "name": "Judges", "testament": "Old", "division": "Historical", "theme": "Cycles of deliverance and the need for a true King", "summary": "A cycle of rebellion, oppression, cry for help, and deliverance through leaders like Deborah, Gideon, and Samson."},
    {"id": 8, "osis": "Ruth", "name": "Ruth", "testament": "Old", "division": "Historical", "theme": "Steadfast love, loyalty, and redemption", "summary": "Ruth's faithful devotion to Naomi in Bethlehem, leading to redemption through Boaz and the lineage of David and Jesus."},
    {"id": 9, "osis": "1Sam", "name": "1 Samuel", "testament": "Old", "division": "Historical", "theme": "From judges to monarchy: Samuel, Saul, and David", "summary": "The transition to Israel's monarchy under Samuel, the tragedy of Saul, and God choosing David by looking at the heart."},
    {"id": 10, "osis": "2Sam", "name": "2 Samuel", "testament": "Old", "division": "Historical", "theme": "David's reign and God's everlasting covenant", "summary": "David's triumphs, the covenant of an enduring throne, personal failure with Bathsheba, and God's enduring grace."},
    {"id": 11, "osis": "1Kgs", "name": "1 Kings", "testament": "Old", "division": "Historical", "theme": "Solomon's temple, wisdom, and the divided kingdom", "summary": "Solomon builds the temple, followed by division into Northern and Southern kingdoms, and Elijah's confrontation on Mount Carmel."},
    {"id": 12, "osis": "2Kgs", "name": "2 Kings", "testament": "Old", "division": "Historical", "theme": "The prophetic witness, decline, and exile", "summary": "Elisha's miracles, the fall of Israel to Assyria, and the fall of Jerusalem to Babylon with hopes for a remnant."},
    {"id": 13, "osis": "1Chr", "name": "1 Chronicles", "testament": "Old", "division": "Historical", "theme": "Priestly perspective on David and worship", "summary": "Genealogies of God's chosen line, David's preparations for the temple, and worship focused on God's enduring mercy."},
    {"id": 14, "osis": "2Chr", "name": "2 Chronicles", "testament": "Old", "division": "Historical", "theme": "The temple, royal revivals, and repentance", "summary": "Solomon's temple dedication ('If my people...'), the kings of Judah, spiritual revivals under Hezekiah and Josiah, and Cyrus' decree of return."},
    {"id": 15, "osis": "Ezra", "name": "Ezra", "testament": "Old", "division": "Historical", "theme": "Return from exile and rebuilding the temple", "summary": "The first exiles return under Zerubbabel to rebuild the altar and temple, followed by Ezra restoring the teaching of the Law."},
    {"id": 16, "osis": "Neh", "name": "Nehemiah", "testament": "Old", "division": "Historical", "theme": "Rebuilding Jerusalem's walls and community renewal", "summary": "Nehemiah's cupbearer prayers, the 52-day wall reconstruction, and national covenant renewal: 'The joy of the Lord is your strength.'"},
    {"id": 17, "osis": "Esth", "name": "Esther", "testament": "Old", "division": "Historical", "theme": "God's hidden providence and courage for such a time as this", "summary": "Queen Esther and Mordecai risk their lives in Persia to thwart Haman's plot and save their people, establishing the feast of Purim."},

    # Poetry & Wisdom
    {"id": 18, "osis": "Job", "name": "Job", "testament": "Old", "division": "Poetry & Wisdom", "theme": "Sovereignty in suffering and trust beyond understanding", "summary": "Job endures deep loss, wrestles with the problem of pain, and encounters God speaking from the whirlwind: 'I know my Redeemer lives.'"},
    {"id": 19, "osis": "Ps", "name": "Psalms", "testament": "Old", "division": "Poetry & Wisdom", "theme": "The prayer book of the Bible: praise, lament, and hope", "summary": "150 songs of worship, thanksgiving, honest grief, and messianic longing across five books, concluding with universal praise."},
    {"id": 20, "osis": "Prov", "name": "Proverbs", "testament": "Old", "division": "Poetry & Wisdom", "theme": "The fear of the Lord is the beginning of wisdom", "summary": "Practical wisdom for daily life, relationships, speech, work, integrity, and humility."},
    {"id": 21, "osis": "Eccl", "name": "Ecclesiastes", "testament": "Old", "division": "Poetry & Wisdom", "theme": "Meaning under the sun and the gift of God", "summary": "An honest exploration of life's fleeting vapor, finding joy in simple gifts, and concluding: 'Fear God and keep His commandments.'"},
    {"id": 22, "osis": "Song", "name": "Song of Solomon", "testament": "Old", "division": "Poetry & Wisdom", "theme": "The beauty of marital love and covenant passion", "summary": "Lyrical celebration of romantic love, commitment, and desire: 'Love is strong as death.'"},

    # Major Prophets
    {"id": 23, "osis": "Isa", "name": "Isaiah", "testament": "Old", "division": "Major Prophets", "theme": "The Holy One of Israel and the Suffering Servant", "summary": "The vision of God's throne ('Holy, holy, holy'), warnings of judgment, the Prince of Peace, the Suffering Servant (Isa 53), and new creation."},
    {"id": 24, "osis": "Jer", "name": "Jeremiah", "testament": "Old", "division": "Major Prophets", "theme": "The weeping prophet and the New Covenant", "summary": "Jeremiah's four-decade call to Judah, prophetic grief over Jerusalem, and the promise of a covenant written on human hearts."},
    {"id": 25, "osis": "Lam", "name": "Lamentations", "testament": "Old", "division": "Major Prophets", "theme": "Grief over Jerusalem and steadfast mercies every morning", "summary": "Acrostic funeral dirges over fallen Jerusalem, centered on the triumphant confession: 'The steadfast love of the Lord never ceases; his mercies are new every morning.'"},
    {"id": 26, "osis": "Ezek", "name": "Ezekiel", "testament": "Old", "division": "Major Prophets", "theme": "God's glory among the exiles and the valley of dry bones", "summary": "Vivid visions by the river Chebar: the departing and returning glory, hearts of stone turned to flesh, and breath entering dry bones."},
    {"id": 27, "osis": "Dan", "name": "Daniel", "testament": "Old", "division": "Major Prophets", "theme": "Faithfulness in Babylon and God's everlasting kingdom", "summary": "Daniel and friends in the fiery furnace and lions' den, and apocalyptic visions of world empires giving way to the Son of Man."},

    # Minor Prophets
    {"id": 28, "osis": "Hos", "name": "Hosea", "testament": "Old", "division": "Minor Prophets", "theme": "God's relentless, pursuing covenant love", "summary": "Hosea's marriage to Gomer pictures God's heartbreak over spiritual adultery and His unwavering promise to heal waywardness."},
    {"id": 29, "osis": "Joel", "name": "Joel", "testament": "Old", "division": "Minor Prophets", "theme": "The Day of the Lord and the outpouring of the Spirit", "summary": "A locust plague warns of judgment, calling for torn hearts, followed by the promise: 'I will pour out my Spirit on all flesh.'"},
    {"id": 30, "osis": "Amos", "name": "Amos", "testament": "Old", "division": "Minor Prophets", "theme": "Justice rolling down like waters and care for the poor", "summary": "A shepherd from Tekoa calls prosperous Israel to account for oppressing the vulnerable: 'Let justice roll on like a river.'"},
    {"id": 31, "osis": "Obad", "name": "Obadiah", "testament": "Old", "division": "Minor Prophets", "theme": "Pride brought low and the Kingdom established", "summary": "A short oracle against Edom for gloating over Jerusalem's fall, declaring God's righteous vindication."},
    {"id": 32, "osis": "Jonah", "name": "Jonah", "testament": "Old", "division": "Minor Prophets", "theme": "God's scandalous mercy to outsider nations", "summary": "A reluctant prophet flees to Tarshish, spends three days in a great fish, preaches to Nineveh, and wrestles with God's abounding mercy."},
    {"id": 33, "osis": "Mic", "name": "Micah", "testament": "Old", "division": "Minor Prophets", "theme": "To do justice, love mercy, and walk humbly with God", "summary": "Denouncing corruption, foretelling the ruler born in Bethlehem, and calling for justice, mercy, and humility."},
    {"id": 34, "osis": "Nah", "name": "Nahum", "testament": "Old", "division": "Minor Prophets", "theme": "God's wrath against brutal tyranny", "summary": "Judgment on Nineveh's cruelty, affirming that the Lord is a stronghold in the day of trouble."},
    {"id": 35, "osis": "Hab", "name": "Habakkuk", "testament": "Old", "division": "Minor Prophets", "theme": "The righteous shall live by faith", "summary": "A prophet questions God's justice, waits on the watchtower, and concludes with a song of joy even if the fig tree does not bud."},
    {"id": 36, "osis": "Zeph", "name": "Zephaniah", "testament": "Old", "division": "Minor Prophets", "theme": "Judgment and God rejoicing over His people with singing", "summary": "Purging of idolatry followed by radiant restoration: 'He will rejoice over you with gladness; he will quiet you with his love.'"},
    {"id": 37, "osis": "Hag", "name": "Haggai", "testament": "Old", "division": "Minor Prophets", "theme": "Rebuild the House of God and consider your ways", "summary": "Post-exilic challenge to stop paneling private homes while God's house lies in ruins, promising greater future glory."},
    {"id": 38, "osis": "Zech", "name": "Zechariah", "testament": "Old", "division": "Minor Prophets", "theme": "Night visions, the humble King on a donkey, and the cleansing fountain", "summary": "'Not by might nor by power, but by my Spirit'; visions of the coming humble King and God dwelling in Jerusalem."},
    {"id": 39, "osis": "Mal", "name": "Malachi", "testament": "Old", "division": "Minor Prophets", "theme": "Honoring God and the Sun of Righteousness with healing in its wings", "summary": "A loving dispute between God and His people regarding worship, marriage, and tithes, anticipating Elijah before the great Day."},

    # Gospels
    {"id": 40, "osis": "Matt", "name": "Matthew", "testament": "New", "division": "Gospels", "theme": "Jesus the promised King and fulfillment of the Law", "summary": "Jesus as the Son of David and new Moses: the Sermon on the Mount, parables of the Kingdom, cross and resurrection, and the Great Commission."},
    {"id": 41, "osis": "Mark", "name": "Mark", "testament": "New", "division": "Gospels", "theme": "Jesus the Servant who gives His life as a ransom", "summary": "Fast-paced narrative emphasizing Jesus' deeds, authority over sickness and demons, suffering servanthood, and the cross."},
    {"id": 42, "osis": "Luke", "name": "Luke", "testament": "New", "division": "Gospels", "theme": "Good news for all people: the poor, the lost, and the outcast", "summary": "An orderly account highlighting Jesus' compassion, parables of grace (Good Samaritan, Prodigal Son), the Holy Spirit, and table fellowship."},
    {"id": 43, "osis": "John", "name": "John", "testament": "New", "division": "Gospels", "theme": "The Word made flesh so that you may believe and have life", "summary": "The seven 'I AM' statements, the seven sign miracles, intimate upper-room discourses, and the cross as Christ's glorification."},

    # Church History
    {"id": 44, "osis": "Acts", "name": "Acts", "testament": "New", "division": "Church History", "theme": "The Holy Spirit empowering the Church to the ends of the earth", "summary": "Pentecost, Peter's boldness, Stephen's martyrdom, Paul's conversion, the Jerusalem council, and the gospel reaching Rome unhindered."},

    # Pauline Epistles
    {"id": 45, "osis": "Rom", "name": "Romans", "testament": "New", "division": "Pauline Epistles", "theme": "The righteousness of God revealed by faith for Jew and Gentile", "summary": "Universal human need, justification by grace alone through faith, life in the Spirit, God's plan for Israel, and practical body life."},
    {"id": 46, "osis": "1Cor", "name": "1 Corinthians", "testament": "New", "division": "Pauline Epistles", "theme": "The cross confronting division, disorder, and resurrection hope", "summary": "Addressing unity, sexual purity, spiritual gifts, the supremacy of love (1 Cor 13), and the bodily resurrection of Christ (1 Cor 15)."},
    {"id": 47, "osis": "2Cor", "name": "2 Corinthians", "testament": "New", "division": "Pauline Epistles", "theme": "Treasure in jars of clay: strength made perfect in weakness", "summary": "Paul's vulnerable defense of his ministry, the ministry of reconciliation, joyful generosity, and glorying in weakness."},
    {"id": 48, "osis": "Gal", "name": "Galatians", "testament": "New", "division": "Pauline Epistles", "theme": "Freedom in Christ and walking by the Spirit", "summary": "Defending the pure gospel of grace against legalism: 'For freedom Christ has set us free; walk by the Spirit.'"},
    {"id": 49, "osis": "Eph", "name": "Ephesians", "testament": "New", "division": "Pauline Epistles", "theme": "United in Christ, one new humanity, and the armor of God", "summary": "God's eternal purpose in Christ, salvation by grace through faith, breaking dividing walls, and putting on the full armor of God."},
    {"id": 50, "osis": "Phil", "name": "Philippians", "testament": "New", "division": "Pauline Epistles", "theme": "Joy in all circumstances and the humility of Christ", "summary": "Written from chains: Christ's self-emptying hymn (Phil 2), pressing toward the prize, rejoicing always, and peace that guards the heart."},
    {"id": 51, "osis": "Col", "name": "Colossians", "testament": "New", "division": "Pauline Epistles", "theme": "The preeminence of Christ in all creation and church", "summary": "Christ is the image of the invisible God, holding all things together; believers are complete in Him and set their minds on things above."},
    {"id": 52, "osis": "1Thess", "name": "1 Thessalonians", "testament": "New", "division": "Pauline Epistles", "theme": "Living in light of Christ's return with faith, love, and hope", "summary": "Commending a young church's faithfulness, encouragement regarding believers who have died, and living blamelessly as children of the day."},
    {"id": 53, "osis": "2Thess", "name": "2 Thessalonians", "testament": "New", "division": "Pauline Epistles", "theme": "Standing firm amidst persecution and awaiting Christ's glory", "summary": "Correcting misunderstandings about the Day of the Lord, encouraging steadfastness, and warning against idleness."},
    {"id": 54, "osis": "1Tim", "name": "1 Timothy", "testament": "New", "division": "Pauline Epistles", "theme": "Sound doctrine, godly leadership, and church order", "summary": "Instructions to young pastor Timothy on prayer, qualifications for elders and deacons, guarding the deposit of truth, and fighting the good fight."},
    {"id": 55, "osis": "2Tim", "name": "2 Timothy", "testament": "New", "division": "Pauline Epistles", "theme": "Finishing the race and passing on the torch of the Gospel", "summary": "Paul's poignant final letter from death row: 'I have fought the good fight, I have finished the race, I have kept the faith.'"},
    {"id": 56, "osis": "Titus", "name": "Titus", "testament": "New", "division": "Pauline Epistles", "theme": "Good works flowing from the grace of God", "summary": "Ordering churches in Crete, appointing mature leaders, and teaching that grace trains us to renounce ungodliness and live self-controlled lives."},
    {"id": 57, "osis": "Phlm", "name": "Philemon", "testament": "New", "division": "Pauline Epistles", "theme": "Reconciliation and brotherhood in Christ", "summary": "A masterfully tender personal appeal to Philemon to welcome back runaway slave Onesimus 'no longer as a bondservant, but as a beloved brother.'"},

    # General Epistles
    {"id": 58, "osis": "Heb", "name": "Hebrews", "testament": "New", "division": "General Epistles", "theme": "Jesus is better: our great High Priest and pioneer of faith", "summary": "Christ's superiority over angels, Moses, and the Levitical priesthood; the better covenant; the hall of faith (Heb 11); and fixing our eyes on Jesus."},
    {"id": 59, "osis": "Jas", "name": "James", "testament": "New", "division": "General Epistles", "theme": "Faith that works: wisdom, speech, and justice", "summary": "Practical Christian ethics: joy in trials, being doers of the word, taming the tongue, and pure religion that visits orphans and widows."},
    {"id": 60, "osis": "1Pet", "name": "1 Peter", "testament": "New", "division": "General Epistles", "theme": "Living hope amidst suffering as elect exiles", "summary": "Born again to a living hope, a holy priesthood, suffering for doing good, and casting all anxiety on God because He cares for you."},
    {"id": 61, "osis": "2Pet", "name": "2 Peter", "testament": "New", "division": "General Epistles", "theme": "Growing in grace and guarding against false teachers", "summary": "Partakers of divine nature, relying on the prophetic word, warning against scoffers, and the day of the Lord that brings new heavens and earth."},
    {"id": 62, "osis": "1John", "name": "1 John", "testament": "New", "division": "General Epistles", "theme": "God is light, God is love, and assurance of eternal life", "summary": "Walking in the light, abiding in God's love, testing the spirits, and knowing with confidence that we have eternal life in the Son."},
    {"id": 63, "osis": "2John", "name": "2 John", "testament": "New", "division": "General Epistles", "theme": "Walking in truth and mutual love", "summary": "A brief letter rejoicing in children walking in the truth, warning against deceivers, and urging steadfast hospitality in sound doctrine."},
    {"id": 64, "osis": "3John", "name": "3 John", "testament": "New", "division": "General Epistles", "theme": "Supporting workers for the truth", "summary": "Praising Gaius' generous hospitality toward traveling ministers and contrasting him with proud, inhospitable Diotrephes."},
    {"id": 65, "osis": "Jude", "name": "Jude", "testament": "New", "division": "General Epistles", "theme": "Contending for the faith once for all delivered to the saints", "summary": "An urgent plea to contend for the faith, keep oneself in the love of God, and the glorious doxology: 'To Him who is able to keep you from stumbling.'"},

    # Prophecy
    {"id": 66, "osis": "Rev", "name": "Revelation", "testament": "New", "division": "Prophecy", "theme": "The triumphant Lamb, victory over evil, and the New Jerusalem", "summary": "The letters to the seven churches, the throne room with the slain and risen Lamb, the climax of history, the final defeat of death, and the New Heavens and Earth where God wipes every tear."},
]

def main():
    print("Connecting to DB:", DB_URL)
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    with open(os.path.join(os.path.dirname(__file__), "../data/bible-kjv.json"), encoding="utf-8") as f:
        bible_json = json.load(f)

    books_data = bible_json["books"]
    osis_to_data = {b["book"]: b for b in books_data}

    print("Inserting 66 Bible books...")
    book_rows = []
    for meta in BIBLE_METADATA:
        osis = meta["osis"]
        b_data = osis_to_data[osis]
        ch_count = len(b_data["chapters"])
        v_count = sum(len(c["verses"]) for c in b_data["chapters"])
        book_rows.append((
            meta["id"],
            meta["osis"],
            meta["name"],
            meta["testament"],
            meta["division"],
            ch_count,
            v_count,
            meta["summary"],
            meta["theme"],
        ))

    cur.execute("TRUNCATE TABLE bible_verses, bible_books RESTART IDENTITY CASCADE;")
    execute_values(
        cur,
        """
        INSERT INTO bible_books (id, osis, name, testament, division, chapter_count, verse_count, summary, theme)
        VALUES %s
        """,
        book_rows
    )
    conn.commit()
    print("66 Books inserted successfully.")

    print("Preparing 31,102 verses...")
    verse_rows = []
    v_id = 1
    for meta in BIBLE_METADATA:
        osis = meta["osis"]
        b_data = osis_to_data[osis]
        for ch_idx, ch in enumerate(b_data["chapters"]):
            ch_num = ch_idx + 1
            for v in ch["verses"]:
                verse_rows.append((
                    v_id,
                    meta["id"],
                    meta["name"],
                    ch_num,
                    v["number"],
                    v["text"].strip(),
                ))
                v_id += 1

    print(f"Executing bulk insert of {len(verse_rows)} verses...")
    execute_values(
        cur,
        """
        INSERT INTO bible_verses (id, book_id, book_name, chapter, verse, text)
        VALUES %s
        """,
        verse_rows,
        page_size=5000
    )
    conn.commit()
    print("All 31,102 verses inserted into PostgreSQL successfully!")

    # Check index and test sample query
    cur.execute("SELECT count(*) FROM bible_verses;")
    total_count = cur.fetchone()[0]
    print(f"Verified count in bible_verses table: {total_count}")

    # Seed sample canonical progress for the demo user
    demo_email = os.environ.get("DEMO_EMAIL", "grace@lumen.app")
    cur.execute("SELECT id FROM users WHERE email = %s LIMIT 1;", (demo_email,))
    user_row = cur.fetchone()
    if user_row:
        user_id = user_row[0]
        print(f"Seeding canonical progress for demo user {user_id}...")
        sample_progress = [
            (user_id, 1, 1), (user_id, 1, 2), (user_id, 1, 3), # Genesis 1-3
            (user_id, 19, 23), (user_id, 19, 139), # Psalms 23, 139
            (user_id, 20, 3), # Proverbs 3
            (user_id, 23, 40), # Isaiah 40
            (user_id, 40, 5), (user_id, 40, 6), (user_id, 40, 7), # Matthew 5-7 (Sermon on Mount)
            (user_id, 42, 15), # Luke 15 (Prodigal Son)
            (user_id, 43, 1), (user_id, 43, 3), # John 1, 3
            (user_id, 50, 4), # Philippians 4
            (user_id, 66, 21), (user_id, 66, 22), # Revelation 21-22
        ]
        execute_values(
            cur,
            """
            INSERT INTO canonical_progress (user_id, book_id, chapter)
            VALUES %s
            ON CONFLICT (user_id, book_id, chapter) DO NOTHING;
            """,
            sample_progress
        )
        conn.commit()
        print("Canonical progress seeded.")

    cur.close()
    conn.close()
    print("Database seeding finished!")

if __name__ == "__main__":
    main()
