export type BibleBookMeta = {
  id: number;
  osis: string;
  name: string;
  testament: "Old" | "New";
  division:
    | "Torah / Pentateuch"
    | "Historical"
    | "Poetry & Wisdom"
    | "Major Prophets"
    | "Minor Prophets"
    | "Gospels"
    | "Church History"
    | "Pauline Epistles"
    | "General Epistles"
    | "Prophecy";
  chapterCount: number;
  verseCount: number;
  theme: string;
  summary: string;
};

export const BIBLE_DIVISIONS = [
  "All",
  "Torah / Pentateuch",
  "Historical",
  "Poetry & Wisdom",
  "Major Prophets",
  "Minor Prophets",
  "Gospels",
  "Church History",
  "Pauline Epistles",
  "General Epistles",
  "Prophecy",
] as const;

export const BIBLE_BOOKS_CATALOG: BibleBookMeta[] = [
  // Pentateuch / Law (1 - 5)
  { id: 1, osis: "Gen", name: "Genesis", testament: "Old", division: "Torah / Pentateuch", chapterCount: 50, verseCount: 1533, theme: "Beginnings, covenant, and the creation of all things", summary: "From the creation of the cosmos to the foundation of the family of faith through Abraham, Isaac, Jacob, and Joseph." },
  { id: 2, osis: "Exod", name: "Exodus", testament: "Old", division: "Torah / Pentateuch", chapterCount: 40, verseCount: 1213, theme: "Deliverance, the Law, and the presence of God", summary: "God hears the groaning of Israel in Egypt, calls Moses, parts the Red Sea, gives the Ten Commandments at Sinai, and tabernacles with His people." },
  { id: 3, osis: "Lev", name: "Leviticus", testament: "Old", division: "Torah / Pentateuch", chapterCount: 27, verseCount: 859, theme: "Holiness, sacrifice, and worship", summary: "Instructions for worship, offerings, priesthood, purity, and the Day of Atonement: 'Be holy, for I am holy.'" },
  { id: 4, osis: "Num", name: "Numbers", testament: "Old", division: "Torah / Pentateuch", chapterCount: 36, verseCount: 1288, theme: "Wilderness wanderings and divine faithfulness", summary: "The journey of Israel through the wilderness, the census, rebellion and mercy, and the preparation of the new generation." },
  { id: 5, osis: "Deut", name: "Deuteronomy", testament: "Old", division: "Torah / Pentateuch", chapterCount: 34, verseCount: 959, theme: "Covenant renewal and loving God with all the heart", summary: "Moses' farewell sermons on the plains of Moab: remembering God's wonders, choosing life, and the Shema ('Hear, O Israel')." },

  // Historical (6 - 17)
  { id: 6, osis: "Josh", name: "Joshua", testament: "Old", division: "Historical", chapterCount: 24, verseCount: 658, theme: "Courage, conquest, and the promised land", summary: "Joshua leads Israel across the Jordan, walls of Jericho fall, and the tribes receive their inheritance with the charge: 'Be strong and courageous.'" },
  { id: 7, osis: "Judg", name: "Judges", testament: "Old", division: "Historical", chapterCount: 21, verseCount: 618, theme: "Cycles of deliverance and the need for a true King", summary: "A cycle of rebellion, oppression, cry for help, and deliverance through leaders like Deborah, Gideon, and Samson." },
  { id: 8, osis: "Ruth", name: "Ruth", testament: "Old", division: "Historical", chapterCount: 4, verseCount: 85, theme: "Steadfast love, loyalty, and redemption", summary: "Ruth's faithful devotion to Naomi in Bethlehem, leading to redemption through Boaz and the lineage of David and Jesus." },
  { id: 9, osis: "1Sam", name: "1 Samuel", testament: "Old", division: "Historical", chapterCount: 31, verseCount: 810, theme: "From judges to monarchy: Samuel, Saul, and David", summary: "The transition to Israel's monarchy under Samuel, the tragedy of Saul, and God choosing David by looking at the heart." },
  { id: 10, osis: "2Sam", name: "2 Samuel", testament: "Old", division: "Historical", chapterCount: 24, verseCount: 695, theme: "David's reign and God's everlasting covenant", summary: "David's triumphs, the covenant of an enduring throne, personal failure with Bathsheba, and God's enduring grace." },
  { id: 11, osis: "1Kgs", name: "1 Kings", testament: "Old", division: "Historical", chapterCount: 22, verseCount: 816, theme: "Solomon's temple, wisdom, and the divided kingdom", summary: "Solomon builds the temple, followed by division into Northern and Southern kingdoms, and Elijah's confrontation on Mount Carmel." },
  { id: 12, osis: "2Kgs", name: "2 Kings", testament: "Old", division: "Historical", chapterCount: 25, verseCount: 719, theme: "The prophetic witness, decline, and exile", summary: "Elisha's miracles, the fall of Israel to Assyria, and the fall of Jerusalem to Babylon with hopes for a remnant." },
  { id: 13, osis: "1Chr", name: "1 Chronicles", testament: "Old", division: "Historical", chapterCount: 29, verseCount: 941, theme: "Priestly perspective on David and worship", summary: "Genealogies of God's chosen line, David's preparations for the temple, and worship focused on God's enduring mercy." },
  { id: 14, osis: "2Chr", name: "2 Chronicles", testament: "Old", division: "Historical", chapterCount: 36, verseCount: 822, theme: "The temple, royal revivals, and repentance", summary: "Solomon's temple dedication ('If my people...'), the kings of Judah, spiritual revivals under Hezekiah and Josiah, and Cyrus' decree of return." },
  { id: 15, osis: "Ezra", name: "Ezra", testament: "Old", division: "Historical", chapterCount: 10, verseCount: 280, theme: "Return from exile and rebuilding the temple", summary: "The first exiles return under Zerubbabel to rebuild the altar and temple, followed by Ezra restoring the teaching of the Law." },
  { id: 16, osis: "Neh", name: "Nehemiah", testament: "Old", division: "Historical", chapterCount: 13, verseCount: 406, theme: "Rebuilding Jerusalem's walls and community renewal", summary: "Nehemiah's cupbearer prayers, the 52-day wall reconstruction, and national covenant renewal: 'The joy of the Lord is your strength.'" },
  { id: 17, osis: "Esth", name: "Esther", testament: "Old", division: "Historical", chapterCount: 10, verseCount: 167, theme: "God's hidden providence and courage for such a time as this", summary: "Queen Esther and Mordecai risk their lives in Persia to thwart Haman's plot and save their people, establishing the feast of Purim." },

  // Poetry & Wisdom (18 - 22)
  { id: 18, osis: "Job", name: "Job", testament: "Old", division: "Poetry & Wisdom", chapterCount: 42, verseCount: 1070, theme: "Sovereignty in suffering and trust beyond understanding", summary: "Job endures deep loss, wrestles with the problem of pain, and encounters God speaking from the whirlwind: 'I know my Redeemer lives.'" },
  { id: 19, osis: "Ps", name: "Psalms", testament: "Old", division: "Poetry & Wisdom", chapterCount: 150, verseCount: 2461, theme: "The prayer book of the Bible: praise, lament, and hope", summary: "150 songs of worship, thanksgiving, honest grief, and messianic longing across five books, concluding with universal praise." },
  { id: 20, osis: "Prov", name: "Proverbs", testament: "Old", division: "Poetry & Wisdom", chapterCount: 31, verseCount: 915, theme: "The fear of the Lord is the beginning of wisdom", summary: "Practical wisdom for daily life, relationships, speech, work, integrity, and humility." },
  { id: 21, osis: "Eccl", name: "Ecclesiastes", testament: "Old", division: "Poetry & Wisdom", chapterCount: 12, verseCount: 222, theme: "Meaning under the sun and the gift of God", summary: "An honest exploration of life's fleeting vapor, finding joy in simple gifts, and concluding: 'Fear God and keep His commandments.'" },
  { id: 22, osis: "Song", name: "Song of Solomon", testament: "Old", division: "Poetry & Wisdom", chapterCount: 8, verseCount: 117, theme: "The beauty of marital love and covenant passion", summary: "Lyrical celebration of romantic love, commitment, and desire: 'Love is strong as death.'" },

  // Major Prophets (23 - 27)
  { id: 23, osis: "Isa", name: "Isaiah", testament: "Old", division: "Major Prophets", chapterCount: 66, verseCount: 1292, theme: "The Holy One of Israel and the Suffering Servant", summary: "The vision of God's throne ('Holy, holy, holy'), warnings of judgment, the Prince of Peace, the Suffering Servant (Isa 53), and new creation." },
  { id: 24, osis: "Jer", name: "Jeremiah", testament: "Old", division: "Major Prophets", chapterCount: 52, verseCount: 1364, theme: "The weeping prophet and the New Covenant", summary: "Jeremiah's four-decade call to Judah, prophetic grief over Jerusalem, and the promise of a covenant written on human hearts." },
  { id: 25, osis: "Lam", name: "Lamentations", testament: "Old", division: "Major Prophets", chapterCount: 5, verseCount: 154, theme: "Grief over Jerusalem and steadfast mercies every morning", summary: "Acrostic funeral dirges over fallen Jerusalem, centered on the triumphant confession: 'The steadfast love of the Lord never ceases; his mercies are new every morning.'" },
  { id: 26, osis: "Ezek", name: "Ezekiel", testament: "Old", division: "Major Prophets", chapterCount: 48, verseCount: 1273, theme: "God's glory among the exiles and the valley of dry bones", summary: "Vivid visions by the river Chebar: the departing and returning glory, hearts of stone turned to flesh, and breath entering dry bones." },
  { id: 27, osis: "Dan", name: "Daniel", testament: "Old", division: "Major Prophets", chapterCount: 12, verseCount: 357, theme: "Faithfulness in Babylon and God's everlasting kingdom", summary: "Daniel and friends in the fiery furnace and lions' den, and apocalyptic visions of world empires giving way to the Son of Man." },

  // Minor Prophets (28 - 39)
  { id: 28, osis: "Hos", name: "Hosea", testament: "Old", division: "Minor Prophets", chapterCount: 14, verseCount: 197, theme: "God's relentless, pursuing covenant love", summary: "Hosea's marriage to Gomer pictures God's heartbreak over spiritual adultery and His unwavering promise to heal waywardness." },
  { id: 29, osis: "Joel", name: "Joel", testament: "Old", division: "Minor Prophets", chapterCount: 3, verseCount: 73, theme: "The Day of the Lord and the outpouring of the Spirit", summary: "A locust plague warns of judgment, calling for torn hearts, followed by the promise: 'I will pour out my Spirit on all flesh.'" },
  { id: 30, osis: "Amos", name: "Amos", testament: "Old", division: "Minor Prophets", chapterCount: 9, verseCount: 146, theme: "Justice rolling down like waters and care for the poor", summary: "A shepherd from Tekoa calls prosperous Israel to account for oppressing the vulnerable: 'Let justice roll on like a river.'" },
  { id: 31, osis: "Obad", name: "Obadiah", testament: "Old", division: "Minor Prophets", chapterCount: 1, verseCount: 21, theme: "Pride brought low and the Kingdom established", summary: "A short oracle against Edom for gloating over Jerusalem's fall, declaring God's righteous vindication." },
  { id: 32, osis: "Jonah", name: "Jonah", testament: "Old", division: "Minor Prophets", chapterCount: 4, verseCount: 48, theme: "God's scandalous mercy to outsider nations", summary: "A reluctant prophet flees to Tarshish, spends three days in a great fish, preaches to Nineveh, and wrestles with God's abounding mercy." },
  { id: 33, osis: "Mic", name: "Micah", testament: "Old", division: "Minor Prophets", chapterCount: 7, verseCount: 105, theme: "To do justice, love mercy, and walk humbly with God", summary: "Denouncing corruption, foretelling the ruler born in Bethlehem, and calling for justice, mercy, and humility." },
  { id: 34, osis: "Nah", name: "Nahum", testament: "Old", division: "Minor Prophets", chapterCount: 3, verseCount: 47, theme: "God's wrath against brutal tyranny", summary: "Judgment on Nineveh's cruelty, affirming that the Lord is a stronghold in the day of trouble." },
  { id: 35, osis: "Hab", name: "Habakkuk", testament: "Old", division: "Minor Prophets", chapterCount: 3, verseCount: 56, theme: "The righteous shall live by faith", summary: "A prophet questions God's justice, waits on the watchtower, and concludes with a song of joy even if the fig tree does not bud." },
  { id: 36, osis: "Zeph", name: "Zephaniah", testament: "Old", division: "Minor Prophets", chapterCount: 3, verseCount: 53, theme: "Judgment and God rejoicing over His people with singing", summary: "Purging of idolatry followed by radiant restoration: 'He will rejoice over you with gladness; he will quiet you with his love.'" },
  { id: 37, osis: "Hag", name: "Haggai", testament: "Old", division: "Minor Prophets", chapterCount: 2, verseCount: 38, theme: "Rebuild the House of God and consider your ways", summary: "Post-exilic challenge to stop paneling private homes while God's house lies in ruins, promising greater future glory." },
  { id: 38, osis: "Zech", name: "Zechariah", testament: "Old", division: "Minor Prophets", chapterCount: 14, verseCount: 211, theme: "Night visions, the humble King on a donkey, and the cleansing fountain", summary: "'Not by might nor by power, but by my Spirit'; visions of the coming humble King and God dwelling in Jerusalem." },
  { id: 39, osis: "Mal", name: "Malachi", testament: "Old", division: "Minor Prophets", chapterCount: 4, verseCount: 55, theme: "Honoring God and the Sun of Righteousness with healing in its wings", summary: "A loving dispute between God and His people regarding worship, marriage, and tithes, anticipating Elijah before the great Day." },

  // Gospels (40 - 43)
  { id: 40, osis: "Matt", name: "Matthew", testament: "New", division: "Gospels", chapterCount: 28, verseCount: 1071, theme: "Jesus the promised King and fulfillment of the Law", summary: "Jesus as the Son of David and new Moses: the Sermon on the Mount, parables of the Kingdom, cross and resurrection, and the Great Commission." },
  { id: 41, osis: "Mark", name: "Mark", testament: "New", division: "Gospels", chapterCount: 16, verseCount: 678, theme: "Jesus the Servant who gives His life as a ransom", summary: "Fast-paced narrative emphasizing Jesus' deeds, authority over sickness and demons, suffering servanthood, and the cross." },
  { id: 42, osis: "Luke", name: "Luke", testament: "New", division: "Gospels", chapterCount: 24, verseCount: 1151, theme: "Good news for all people: the poor, the lost, and the outcast", summary: "An orderly account highlighting Jesus' compassion, parables of grace (Good Samaritan, Prodigal Son), the Holy Spirit, and table fellowship." },
  { id: 43, osis: "John", name: "John", testament: "New", division: "Gospels", chapterCount: 21, verseCount: 879, theme: "The Word made flesh so that you may believe and have life", summary: "The seven 'I AM' statements, the seven sign miracles, intimate upper-room discourses, and the cross as Christ's glorification." },

  // Church History (44)
  { id: 44, osis: "Acts", name: "Acts", testament: "New", division: "Church History", chapterCount: 28, verseCount: 1007, theme: "The Holy Spirit empowering the Church to the ends of the earth", summary: "Pentecost, Peter's boldness, Stephen's martyrdom, Paul's conversion, the Jerusalem council, and the gospel reaching Rome unhindered." },

  // Pauline Epistles (45 - 57)
  { id: 45, osis: "Rom", name: "Romans", testament: "New", division: "Pauline Epistles", chapterCount: 16, verseCount: 433, theme: "The righteousness of God revealed by faith for Jew and Gentile", summary: "Universal human need, justification by grace alone through faith, life in the Spirit, God's plan for Israel, and practical body life." },
  { id: 46, osis: "1Cor", name: "1 Corinthians", testament: "New", division: "Pauline Epistles", chapterCount: 16, verseCount: 437, theme: "The cross confronting division, disorder, and resurrection hope", summary: "Addressing unity, sexual purity, spiritual gifts, the supremacy of love (1 Cor 13), and the bodily resurrection of Christ (1 Cor 15)." },
  { id: 47, osis: "2Cor", name: "2 Corinthians", testament: "New", division: "Pauline Epistles", chapterCount: 13, verseCount: 257, theme: "Treasure in jars of clay: strength made perfect in weakness", summary: "Paul's vulnerable defense of his ministry, the ministry of reconciliation, joyful generosity, and glorying in weakness." },
  { id: 48, osis: "Gal", name: "Galatians", testament: "New", division: "Pauline Epistles", chapterCount: 6, verseCount: 149, theme: "Freedom in Christ and walking by the Spirit", summary: "Defending the pure gospel of grace against legalism: 'For freedom Christ has set us free; walk by the Spirit.'" },
  { id: 49, osis: "Eph", name: "Ephesians", testament: "New", division: "Pauline Epistles", chapterCount: 6, verseCount: 155, theme: "United in Christ, one new humanity, and the armor of God", summary: "God's eternal purpose in Christ, salvation by grace through faith, breaking dividing walls, and putting on the full armor of God." },
  { id: 50, osis: "Phil", name: "Philippians", testament: "New", division: "Pauline Epistles", chapterCount: 4, verseCount: 104, theme: "Joy in all circumstances and the humility of Christ", summary: "Written from chains: Christ's self-emptying hymn (Phil 2), pressing toward the prize, rejoicing always, and peace that guards the heart." },
  { id: 51, osis: "Col", name: "Colossians", testament: "New", division: "Pauline Epistles", chapterCount: 4, verseCount: 95, theme: "The preeminence of Christ in all creation and church", summary: "Christ is the image of the invisible God, holding all things together; believers are complete in Him and set their minds on things above." },
  { id: 52, osis: "1Thess", name: "1 Thessalonians", testament: "New", division: "Pauline Epistles", chapterCount: 5, verseCount: 89, theme: "Living in light of Christ's return with faith, love, and hope", summary: "Commending a young church's faithfulness, encouragement regarding believers who have died, and living blamelessly as children of the day." },
  { id: 53, osis: "2Thess", name: "2 Thessalonians", testament: "New", division: "Pauline Epistles", chapterCount: 3, verseCount: 47, theme: "Standing firm amidst persecution and awaiting Christ's glory", summary: "Correcting misunderstandings about the Day of the Lord, encouraging steadfastness, and warning against idleness." },
  { id: 54, osis: "1Tim", name: "1 Timothy", testament: "New", division: "Pauline Epistles", chapterCount: 6, verseCount: 113, theme: "Sound doctrine, godly leadership, and church order", summary: "Instructions to young pastor Timothy on prayer, qualifications for elders and deacons, guarding the deposit of truth, and fighting the good fight." },
  { id: 55, osis: "2Tim", name: "2 Timothy", testament: "New", division: "Pauline Epistles", chapterCount: 4, verseCount: 83, theme: "Finishing the race and passing on the torch of the Gospel", summary: "Paul's poignant final letter from death row: 'I have fought the good fight, I have finished the race, I have kept the faith.'" },
  { id: 56, osis: "Titus", name: "Titus", testament: "New", division: "Pauline Epistles", chapterCount: 3, verseCount: 46, theme: "Good works flowing from the grace of God", summary: "Ordering churches in Crete, appointing mature leaders, and teaching that grace trains us to renounce ungodliness and live self-controlled lives." },
  { id: 57, osis: "Phlm", name: "Philemon", testament: "New", division: "Pauline Epistles", chapterCount: 1, verseCount: 25, theme: "Reconciliation and brotherhood in Christ", summary: "A masterfully tender personal appeal to Philemon to welcome back runaway slave Onesimus 'no longer as a bondservant, but as a beloved brother.'" },

  // General Epistles (58 - 65)
  { id: 58, osis: "Heb", name: "Hebrews", testament: "New", division: "General Epistles", chapterCount: 13, verseCount: 303, theme: "Jesus is better: our great High Priest and pioneer of faith", summary: "Christ's superiority over angels, Moses, and the Levitical priesthood; the better covenant; the hall of faith (Heb 11); and fixing our eyes on Jesus." },
  { id: 59, osis: "Jas", name: "James", testament: "New", division: "General Epistles", chapterCount: 5, verseCount: 108, theme: "Faith that works: wisdom, speech, and justice", summary: "Practical Christian ethics: joy in trials, being doers of the word, taming the tongue, and pure religion that visits orphans and widows." },
  { id: 60, osis: "1Pet", name: "1 Peter", testament: "New", division: "General Epistles", chapterCount: 5, verseCount: 105, theme: "Living hope amidst suffering as elect exiles", summary: "Born again to a living hope, a holy priesthood, suffering for doing good, and casting all anxiety on God because He cares for you." },
  { id: 61, osis: "2Pet", name: "2 Peter", testament: "New", division: "General Epistles", chapterCount: 3, verseCount: 61, theme: "Growing in grace and guarding against false teachers", summary: "Partakers of divine nature, relying on the prophetic word, warning against scoffers, and the day of the Lord that brings new heavens and earth." },
  { id: 62, osis: "1John", name: "1 John", testament: "New", division: "General Epistles", chapterCount: 5, verseCount: 105, theme: "God is light, God is love, and assurance of eternal life", summary: "Walking in the light, abiding in God's love, testing the spirits, and knowing with confidence that we have eternal life in the Son." },
  { id: 63, osis: "2John", name: "2 John", testament: "New", division: "General Epistles", chapterCount: 1, verseCount: 13, theme: "Walking in truth and mutual love", summary: "A brief letter rejoicing in children walking in the truth, warning against deceivers, and urging steadfast hospitality in sound doctrine." },
  { id: 64, osis: "3John", name: "3 John", testament: "New", division: "General Epistles", chapterCount: 1, verseCount: 14, theme: "Supporting workers for the truth", summary: "Praising Gaius' generous hospitality toward traveling ministers and contrasting him with proud, inhospitable Diotrephes." },
  { id: 65, osis: "Jude", name: "Jude", testament: "New", division: "General Epistles", chapterCount: 1, verseCount: 25, theme: "Contending for the faith once for all delivered to the saints", summary: "An urgent plea to contend for the faith, keep oneself in the love of God, and the glorious doxology: 'To Him who is able to keep you from stumbling.'" },

  // Prophecy (66)
  { id: 66, osis: "Rev", name: "Revelation", testament: "New", division: "Prophecy", chapterCount: 22, verseCount: 404, theme: "The triumphant Lamb, victory over evil, and the New Jerusalem", summary: "The letters to the seven churches, the throne room with the slain and risen Lamb, the climax of history, the final defeat of death, and the New Heavens and Earth where God wipes every tear." }
];

export const TOTAL_CANONICAL_CHAPTERS = BIBLE_BOOKS_CATALOG.reduce(
  (sum, b) => sum + b.chapterCount,
  0
); // 1189

export const TOTAL_CANONICAL_VERSES = BIBLE_BOOKS_CATALOG.reduce(
  (sum, b) => sum + b.verseCount,
  0
); // 31102

export const OT_CHAPTERS = BIBLE_BOOKS_CATALOG.filter((b) => b.testament === "Old").reduce(
  (sum, b) => sum + b.chapterCount,
  0
); // 929

export const NT_CHAPTERS = BIBLE_BOOKS_CATALOG.filter((b) => b.testament === "New").reduce(
  (sum, b) => sum + b.chapterCount,
  0
); // 260

export function getBookById(id: number): BibleBookMeta | undefined {
  return BIBLE_BOOKS_CATALOG.find((b) => b.id === id);
}

export function getBookByNameOrOsis(query: string): BibleBookMeta | undefined {
  const q = query.trim().toLowerCase();
  return BIBLE_BOOKS_CATALOG.find(
    (b) => b.name.toLowerCase() === q || b.osis.toLowerCase() === q
  );
}
