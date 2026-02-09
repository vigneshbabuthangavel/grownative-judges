import { SUPPORTED_LANGUAGES } from "@/lib/constants";

export interface LevelStub {
    level: number;
    text_native: string;
    text_transliteration?: string;
    text_english: string;
    imageCaption: string;
}

type StubMap = Record<string, LevelStub[]>;

export const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES;

export const LEVEL_STUBS: StubMap = {
    ta: [
        {
            level: 1,
            text_native: "இது ஒரு பூனை.",
            text_transliteration: "Idhu oru poonai.",
            text_english: "This is a cat.",
            imageCaption: "A cute orange cat sitting."
        },
        {
            level: 2,
            text_native: "பூனை பால் குடிக்கிறது! அது மகிழ்ச்சியாக உள்ளது.",
            text_transliteration: "Poonai paal kudikkiradhu! Adhu magizhchiyaaga ulladhu.",
            text_english: "The cat drinks milk! It is happy.",
            imageCaption: "Cat drinking milk from a bowl."
        },
        {
            level: 3,
            text_native: "என் பூனைக்கு ஆரஞ்சு நிறம். அது மெத்தையில் தூங்குகிறது.",
            text_transliteration: "En poonaikku orange niram. Adhu methaiyil thoongugiradhu.",
            text_english: "My cat is orange. It sleeps on the mat.",
            imageCaption: "Orange cat sleeping on a soft mat."
        },
        {
            level: 4,
            text_native: "நேற்று, பூனை ஒரு எலியைப் பார்த்தது. 'மியாவ்!' என்று கத்தியது.",
            text_transliteration: "Netru, poonai oru eliyaip paarthadhu. 'Meow!' endru kathiyadhu.",
            text_english: "Yesterday, the cat saw a mouse. 'Meow!' it cried.",
            imageCaption: "Cat looking surprised at a mouse."
        },
        {
            level: 5,
            text_native: "மழை பெய்யும்போது, பூனை ஜன்னல் ஓரத்தில் அமர்ந்து, துளிகள் விழுவதை வேடிக்கை பார்க்கும்.",
            text_transliteration: "Mazhai peiyumbodhu, poonai jannal orathil amarndhu, thuligal vizhuvadhai vedikkai paarkkum.",
            text_english: "When it rains, the cat sits by the window and watches the drops fall.",
            imageCaption: "Cat looking out a rainy window."
        },
        {
            level: 6,
            text_native: "வெகு காலத்திற்கு முன்பு, பூனையும் புலியும் நண்பர்களாக இருந்தன! அவை காட்டில் ஒன்றாக வேட்டையாடின.",
            text_transliteration: "Vegu kaalathirku munbu, poonaiyum puliyum nanbargalaaga irundhana! Avai kaattil ondraaga vettaiyaadina.",
            text_english: "Long ago, the cat and the tiger were friends! They hunted together in the forest.",
            imageCaption: "A cat and a tiger sitting side by side."
        },
        {
            level: 7,
            text_native: "பூனைகள் சிறந்த வேட்டைக்காரர்கள். அவற்றுக்கு இருளில் பார்க்கும் சக்தியும், அபாரமான சமநிலையும் உண்டு.",
            text_transliteration: "Poonaigal sirandha vettaikaarargal. Avatrukku irulil paarkkum sakthiyum, abaaramana samanilaiyum undu.",
            text_english: "Cats are excellent hunters. They have the power to see in the dark and amazing balance.",
            imageCaption: "Cat balancing on a fence at night."
        },
        {
            level: 8,
            text_native: "பண்டைய எகிப்தில் பூனைகள் தெய்வங்களாக வணங்கப்பட்டன. மனிதர்களுக்கும் பூனைகளுக்கும் இடையிலான நட்பு பல்லாயிரம் ஆண்டுகள் பழமையானது.",
            text_transliteration: "Pandaiya Egipthil poonaigal dheivangalaaga vanangappattana. Manidhargalukkum poonaigalukkum idaiyaillana natpu pallaayiram aandugal pazhamaiyaanadhu.",
            text_english: "In ancient Egypt, cats were worshipped as gods. The friendship between humans and cats is thousands of years old.",
            imageCaption: "Ancient Egyptian statues of cats."
        }
    ],
    en: [
        {
            level: 1,
            text_native: "This is a cat.",
            text_transliteration: "",
            text_english: "This is a cat.",
            imageCaption: "A cute orange cat sitting."
        },
        {
            level: 2,
            text_native: "The cat drinks milk! It is so happy.",
            text_transliteration: "",
            text_english: "The cat drinks milk! It is so happy.",
            imageCaption: "Cat drinking milk from a bowl."
        },
        {
            level: 3,
            text_native: "My cat uses its sharp claws to climb the high tree.",
            text_transliteration: "",
            text_english: "My cat uses its sharp claws to climb the high tree.",
            imageCaption: "Cat climbing a tree."
        },
        {
            level: 4,
            text_native: "Yesterday, the cat heard a noise. 'Meow?' it asked, looking for the mouse.",
            text_transliteration: "",
            text_english: "Yesterday, the cat heard a noise. 'Meow?' it asked, looking for the mouse.",
            imageCaption: "Cat looking curious."
        },
        {
            level: 5,
            text_native: "When the thunder rolls, the frightened cat hides under the bed until the storm passes.",
            text_transliteration: "",
            text_english: "When the thunder rolls, the frightened cat hides under the bed until the storm passes.",
            imageCaption: "Cat hiding under a bed."
        },
        {
            level: 6,
            text_native: "Legend says that the cat taught the tiger everything it knows, except for one trick: how to climb trees!",
            text_transliteration: "",
            text_english: "Legend says that the cat taught the tiger everything it knows, except for one trick: how to climb trees!",
            imageCaption: "Tiger looking up at a cat in a tree."
        },
        {
            level: 7,
            text_native: "Felines are obligate carnivores, meaning their physiology requires meat to survive. They are apex predators in many ecosystems.",
            text_transliteration: "",
            text_english: "Felines are obligate carnivores, meaning their physiology requires meat to survive. They are apex predators in many ecosystems.",
            imageCaption: "A wild cat hunting in the grass."
        },
        {
            level: 8,
            text_native: "The domestication of the cat (Felis catus) likely occurred in the Near East around 7500 BC, coinciding with the rise of agriculture and the need to control rodents.",
            text_transliteration: "",
            text_english: "The domestication of the cat (Felis catus) likely occurred in the Near East around 7500 BC, coinciding with the rise of agriculture and the need to control rodents.",
            imageCaption: "Ancient farm scene with a cat."
        }
    ],
    hi: [
        {
            level: 1,
            text_native: "यह एक बिल्ली है।",
            text_transliteration: "Yeh ek billi hai.",
            text_english: "This is a cat.",
            imageCaption: "A cute orange cat sitting."
        },
        {
            level: 2,
            text_native: "बिल्ली दूध पीती है! वह खुश है।",
            text_transliteration: "Billi doodh peeti hai! Woh khush hai.",
            text_english: "The cat drinks milk! It is happy.",
            imageCaption: "Cat drinking milk from a bowl."
        },
        {
            level: 3,
            text_native: "मेरी बिल्ली काली है। वह चटाई पर सोती है।",
            text_transliteration: "Meri billi kaali hai. Woh chatai par soti hai.",
            text_english: "My cat is black. She sleeps on the mat.",
            imageCaption: "Black cat sleeping on a mat."
        },
        {
            level: 4,
            text_native: "कल बिल्ली ने एक चूहा देखा। 'म्याऊ!' वह चिल्लाई।",
            text_transliteration: "Kal billi ne ek chuha dekha. 'Meow!' woh chillaayi.",
            text_english: "Yesterday the cat saw a mouse. 'Meow!' it cried.",
            imageCaption: "Cat looking at a mouse."
        },
        {
            level: 5,
            text_native: "जब बारिश होती है, तो बिल्ली खिड़की के पास बैठकर बूंदों को गिरते हुए देखती है।",
            text_transliteration: "Jab baarish hoti hai, toh billi khidki ke paas baithkar boondon ko girte hue dekhti hai.",
            text_english: "When it rains, the cat sits by the window and watches the drops fall.",
            imageCaption: "Cat by a rainy window."
        },
        {
            level: 6,
            text_native: "बहुत समय पहले, बिल्ली और शेर दोस्त थे। वे जंगल में एक साथ शिकार करते थे।",
            text_transliteration: "Bahut samay pehle, billi aur sher dost the. Ve jungle mein ek saath shikaar karte the.",
            text_english: "Long ago, the cat and the lion were friends. They hunted together in the forest.",
            imageCaption: "Cat and Lion together."
        },
        {
            level: 7,
            text_native: "बिल्लियाँ बहुत ही फुर्तीली शिकारी होती हैं। वे अंधेरे में भी आसानी से देख सकती हैं।",
            text_transliteration: "Billiyan bahut hi phurtili shikaari hoti hain. Ve andhere mein bhi aasaani se dekh sakti hain.",
            text_english: "Cats are very agile hunters. They can see easily even in the dark.",
            imageCaption: "Cat hunting at night."
        },
        {
            level: 8,
            text_native: "प्राचीन मिस्र में बिल्लियों को देवी के रूप में पूजा जाता था। मनुष्यों और बिल्लियों की दोस्ती हजारों साल पुरानी है।",
            text_transliteration: "Prachin Misr mein billiyon ko devi ke roop mein pooja jaata tha. Manushyon aur billiyon ki dosti hazaaron saal puraani hai.",
            text_english: "In ancient Egypt, cats were worshipped as goddesses. The friendship between humans and cats is thousands of years old.",
            imageCaption: "Egyptian cat statue."
        }
    ],
    ml: [
        {
            level: 1,
            text_native: "ഇതൊരു പൂച്ചയാണ്.",
            text_transliteration: "Ithoru poochayaanu.",
            text_english: "This is a cat.",
            imageCaption: "A cute cat."
        },
        {
            level: 2,
            text_native: "പൂച്ച പാൽ കുടിക്കുന്നു! അതിന് സന്തോഷമായി.",
            text_transliteration: "Poocha paal kudikkunnu! Athinu santhoshamaayi.",
            text_english: "The cat drinks milk! It is happy.",
            imageCaption: "Cat drinking milk."
        },
        {
            level: 3,
            text_native: "എന്റെ പൂച്ചയ്ക്ക് വെളുത്ത നിറമാണ്. അത് കസേരയിൽ ഉറങ്ങുന്നു.",
            text_transliteration: "Ente poochayakku velutha niram aanu. Athu kaserayil urangunnu.",
            text_english: "My cat is white. It sleeps on the chair.",
            imageCaption: "White cat on a chair."
        },
        {
            level: 4,
            text_native: "ഇന്നലെ പൂച്ച ഒരു എലിയെ കണ്ടു. 'മ്യാവൂ' എന്ന് അത് വിളിച്ചു.",
            text_transliteration: "Innale poocha oru eliye kandu. 'Meow' ennu athu vilichu.",
            text_english: "Yesterday the cat saw a mouse. It called out 'Meow'.",
            imageCaption: "Cat seeing a mouse."
        },
        {
            level: 5,
            text_native: "മഴ പെയ്യുമ്പോൾ, പൂച്ച ജനലരികിൽ ഇരുന്നുകൊണ്ട് മഴത്തുള്ളികൾ നോക്കിനിൽക്കും.",
            text_transliteration: "Mazha peyyumbol, poocha janalarikil irunnukondu mazhathullikal nokkinilkum.",
            text_english: "When it rains, the cat sits by the window watching the raindrops.",
            imageCaption: "Cat watching rain."
        },
        {
            level: 6,
            text_native: "പണ്ട് പണ്ട്, പൂച്ചയും കടുവയും സുഹൃത്തുക്കളായിരുന്നു. അവർ കാട്ടിൽ ഒരുമിച്ച് താമസിച്ചിരുന്നു.",
            text_transliteration: "Pandu pandu, poochayum kaduvayum suhruthukkal aayirunnu. Avar kaattil orumichu thamasichirunnu.",
            text_english: "Long long ago, the cat and the tiger were friends. They lived together in the forest.",
            imageCaption: "Cat and Tiger together."
        },
        {
            level: 7,
            text_native: "പൂച്ചകൾക്ക് രാത്രിയിൽ കാണാനുള്ള കഴിവ് മികച്ചതാണ്. അതുകൊണ്ട് അവ മികച്ച വേട്ടക്കാരാണ്.",
            text_transliteration: "Poochakallekku raathriyil kaananulla kazhivu mikachathaanu. Athukondu ava mikacha vettakkaaraanu.",
            text_english: "Cats have excellent night vision. That is why they are great hunters.",
            imageCaption: "Cat eyes glowing in dark."
        },
        {
            level: 8,
            text_native: "പുരാതന ഈജിപ്തിൽ പൂച്ചകളെ ദൈവങ്ങളെപ്പോലെ ആരാധിച്ചിരുന്നു. മനുഷ്യരും പൂച്ചകളും തമ്മിലുള്ള ബന്ധത്തിന് ചരിത്രപരമായ പ്രാധാന്യമുണ്ട്.",
            text_transliteration: "Puraathana Egyptil poochakale daivangaleppole aaraadhichirunnu. Manushyarum poochakalum thammilulla bandhathinu charithraparamaya praadhaanyamundu.",
            text_english: "In ancient Egypt, cats were worshipped like gods. The bond between humans and cats has historical significance.",
            imageCaption: "Ancient history of cats."
        }
    ],
    // Placeholders for new languages (copying English for structure, would be localized in real app)
    ja: [
        {
            level: 1,
            text_native: "これは猫です。",
            text_transliteration: "Kore wa neko desu.",
            text_english: "This is a cat.",
            imageCaption: "A cute cat."
        },
        // ... (Repeating structure for levels 2-8 simply to prevent crashes) ...
        { level: 2, text_native: "猫はミルクを飲みます！とても幸せです。", text_english: "The cat drinks milk! It is so happy.", imageCaption: "Cat drinking milk." },
        { level: 3, text_native: "私の猫は高い木に登ります。", text_english: "My cat climbs the high tree.", imageCaption: "Cat climbing tree." },
        { level: 4, text_native: "昨日、猫はネズミを見ました。「ニャー？」", text_english: "Yesterday, the cat saw a mouse.", imageCaption: "Cat looking curious." },
        { level: 5, text_native: "雷が鳴ると、怖がった猫はベッドの下に隠れます。", text_english: "When thunder rolls, the cat hides.", imageCaption: "Cat hiding." },
        { level: 6, text_native: "猫がトラにすべてを教えたという伝説があります。", text_english: "Legend says cat taught the tiger.", imageCaption: "Tiger and Cat." },
        { level: 7, text_native: "猫は夜でも簡単に見ることができます。", text_english: "Cats see easily in the dark.", imageCaption: "Cat at night." },
        { level: 8, text_native: "古代エジプトでは、猫は神として崇拝されていました。", text_english: "In ancient Egypt, cats were gods.", imageCaption: "Egyptian cat." }
    ],
    zh: [
        { level: 1, text_native: "这是一只猫。", text_transliteration: "Zhè shì yī zhī māo.", text_english: "This is a cat.", imageCaption: "A cute cat." },
        { level: 2, text_native: "猫在这儿喝牛奶。它很开心。", text_english: "The cat drinks milk. It is happy.", imageCaption: "Cat drinking milk." },
        { level: 3, text_native: "我的猫爬上了高树。", text_english: "My cat climbs the high tree.", imageCaption: "Cat climbing tree." },
        { level: 4, text_native: "昨天，猫看见了一只老鼠。“喵？”", text_english: "Yesterday the cat saw a mouse.", imageCaption: "Cat and mouse." },
        { level: 5, text_native: "打雷时，受惊的猫躲在床底下。", text_english: "Cat hides under bed during thunder.", imageCaption: "Cat hiding." },
        { level: 6, text_native: "传说猫教会了老虎所有的本领。", text_english: "Legend says cat taught the tiger.", imageCaption: "Tiger and cat." },
        { level: 7, text_native: "猫是优秀的猎手，夜视能力极强。", text_english: "Cats are great hunters.", imageCaption: "Cat hunting." },
        { level: 8, text_native: "在古埃及，猫被视为神灵。", text_english: "In ancient Egypt, cats were gods.", imageCaption: "Egyptian cat." }
    ],
    es: [
        { level: 1, text_native: "Esto es un gato.", text_english: "This is a cat.", imageCaption: "A cute cat." },
        { level: 2, text_native: "¡El gato bebe leche! Está muy feliz.", text_english: "The cat drinks milk! It is happy.", imageCaption: "Cat drinking milk." },
        { level: 3, text_native: "Mi gato trepa al árbol alto.", text_english: "My cat climbs the high tree.", imageCaption: "Cat climbing." },
        { level: 4, text_native: "Ayer, el gato vio un ratón. '¡Miau!'", text_english: "Yesterday the cat saw a mouse.", imageCaption: "Cat and mouse." },
        { level: 5, text_native: "Cuando truena, el gato asustado se esconde bajo la cama.", text_english: "Cat hides under bed.", imageCaption: "Cat hiding." },
        { level: 6, text_native: "Dice la leyenda que el gato enseñó al tigre todo lo que sabe.", text_english: "Legend says cat taught tiger.", imageCaption: "Tiger and cat." },
        { level: 7, text_native: "Los felinos son carnívoros obligados.", text_english: "Felines are obligate carnivores.", imageCaption: "Wild cat." },
        { level: 8, text_native: "La domesticación del gato ocurrió en el Próximo Oriente.", text_english: "Cat domestication happening in Near East.", imageCaption: "Ancient cat." }
    ]
};
