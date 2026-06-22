/* ==========================================================================
   AuraReader AI - Application Logic
   ========================================================================== */

// Pre-loaded Demo Books Database (Agent 01 Outline & Agent 02 Podcast)
const DEMO_BOOKS = {
    "atomic-habits": {
        title: "原子習慣",
        author: "James Clear",
        highlight: "決定你人生的，不是你的目標，而是你的系統；每天進步 1%，一年後你將強大 37 倍。",
        pain: "拼命設立宏大的目標（如減肥十公斤、考取專業證照），卻總是在幾週後半途而廢，陷入自我懷疑與拖延的惡性循環中。",
        solve: "將焦點從追求單一目標轉移到「打造可持續系統」與「重塑身份認同」，透過微小的行為改變，建立堅不可摧的日常習慣迴圈。",
        takeaways: [
            {
                title: "行為改變的三個層次與「身份認同」的重塑",
                theory: "習慣的改變分為三個層次：結果改變（例如減重）、過程改變（例如每天運動）以及身份認同改變（例如成為一個健康的人）。多數人從「結果」著手，而真正持久且無痛的改變必須由內而外，從定義「我是誰」開始。當你打從心底相信自己是個「讀書人」而非「正在嘗試培養讀書習慣的人」時，你的行為將自然順應身份認同。",
                case: "書中提到一個戒菸的經典案例：當旁人遞上一根煙時，第一位戒菸者回答「不用了，我正在戒菸」，這代表他仍然自視為吸菸者；而第二位戒菸者則簡短回答「不用了，我不抽菸」，這微小的用詞轉變，說明他已經將自己重新定位為非吸菸者。這層身份認同的重塑，大幅提升了戒菸成功的機率。"
            },
            {
                title: "習慣迴圈的四大步驟與行為改變定律",
                theory: "任何行為習慣都由四步迴圈構成：提示（Cue）、渴望（Craving）、回應（Response）、獎賞（Reward）。若要建立一個新的好習慣，必須針對這四個步驟進行科學化的系統設計：讓提示「顯而易見」（放大視覺提示）、讓渴望「有吸引力」（綑綁喜好事物）、讓回應「輕而易舉」（降低行動難度）、讓獎賞「令人滿足」（創造即時的反饋）。",
                case: "英國自由車國家隊（Team Sky）曾歷經近百年的奪冠荒。新教練戴夫·布萊爾斯福德（Dave Brailsford）上任後，實施了「邊際效益的微小加總」策略。他們重新設計了選手的細微習慣：測試多款按摩膠以加速肌肉復原、挑選最適合的睡枕確保深度睡眠、甚至是把車隊卡車內部塗成白色以利發現微小塵埃。這些看似微不足道的 1% 改進，加總起來讓車隊在幾年內橫掃環法自由車賽。"
            },
            {
                title: "兩分鐘法則與物理環境設計",
                theory: "當你要開始一項新習慣時，該行為在初期應該被簡化到在「兩分鐘內」就能完成。其核心目的不是為了在兩分鐘內取得巨大成果，而是為了打破「起步阻力」，建立行為的起動慣性。同時，重新規劃你的物理空間，把好習慣的提示在眼前放大，並提高壞習慣的執行阻力，可以讓大腦更輕鬆地做出選擇。",
                case: "作者分享他自己建立運動習慣的經歷：他並不強求自己每天下班後去健身房高強度運動一小時，因為那對意志力消耗極大。他給自己設定的兩分鐘目標是：「換上運動鞋，走出大門。」一旦他穿好鞋子走到戶外，前進的慣性就已經啟動，後續去跑步和鍛鍊便變得順理成章且容易克服。"
            }
        ],
        action_title: "微縮兩分鐘習慣啟動計畫",
        action_desc: "今天晚上睡前，挑選一個你一直想建立但難以維持的習慣，將其重新設計成一個能在「兩分鐘內」完成的行動，並在你的物理環境中為它創造一個「顯而易見」的物理提示。",
        action_steps: [
            "決定一個新習慣，並將其拆解為兩分鐘版本（例如：將「讀書一小時」縮減為「讀書一頁」）。",
            "在顯眼的地方擺放提示（例如：把你要讀的那本書直接打開，平放在床頭櫃或枕頭中央）。",
            "明天早上起床或晚上回家，立刻執行這項兩分鐘行動，並在完成後大聲對自己說「我做得很好」（給予即時獎賞）。"
        ],
        podcast_script: "嗨，今天過得好嗎？想跟你聊聊一件我們每個人都經歷過的事情。不知道你是不是也跟我一樣，在新年或者某個特別想改變的深夜，給自己定下了非常宏大的目標？比如「我今年一定要減肥十公斤」，或者是「我一定要考過這張高難度證照」、「我要在一年內讀完五十本書」。我們當時雄心勃勃，買了新運動鞋，報了昂貴的線上課程，買了一大堆書擺在書架上。但老實說，是不是往往在兩三週之後，那股熱情就莫名妙地消失了？最後，我們又躺回了沙發上，一邊滑著手機，一邊看著電視，心裡還充滿了深深的自責與挫折感，覺得自己真是個沒毅力、沒有自制力的人。\n\n如果你也有過這樣的掙扎，我想抱抱你，因為這真的不是你的錯。詹姆斯·克利爾在《原子習慣》這本書中，提出了一個非常溫暖且震撼人的觀點。他說：決定你人生的，根本不是你的目標，而是你背後的「系統」。什麼意思呢？目標是你想達到的結果，而系統是你達到結果的過程。如果你的系統不對，就算你的目標再偉大，你也無法到達。他甚至給出了一個非常迷人的數學公式：如果你每天能比昨天進步百分之一，那麼在一年三百六十五天之後，你將會比現在強大整整三十七倍！相反地，如果你每天退步百分之一，一年後你的能力會幾乎降到零。這就是微小習慣的複利效應。我們往往太過關注那些耀眼的成果，卻忽視了那些日常生活中如同原子般微小的習慣，正是它們在時間的複利下，悄悄雕刻了我們的命運。\n\n那麼，我们要如何打造一個不會失敗的習慣系統呢？書中提出第一個非常核心的關鍵是：習慣改變必須由內而外，也就是重塑你的「身份認同」。行為改變有三個層次：結果、過程和身份認同。大多數人在嘗試建立新習慣時，都是從「結果」著手，比如「我要減肥（結果）」，所以「我每天去跑步（操作）」。但這很難持久，因為你內心深處的自我認同並沒有改變。當你去跑步時，你的潛意識仍然覺得自己是一個不愛運動的人，只是在勉強自己。\n\n書中提到一個非常有意思的戒菸案例：當旁人遞上一根煙時，第一位戒菸者回答「不用了，我正在戒菸」，這聽起來很合理，但他的潛意識裡依然自視為一個「吸菸者」，只是在用理智壓抑自己；而第二位戒菸者則簡短地回答「不用了，我不抽菸」，這微小的用詞轉變，說明他已經從根本上重塑了身份認同，將自己重新定義為非吸菸者。當你打從心底相信自己是個「讀書人」而非「正在嘗試培養讀書習慣的人」時，你的行為就會自然順應你的身份，不需要痛苦地消耗意志力。同樣的，如果你想成為一個健康的人，那麼每次面對垃圾食物的誘惑時，你不需要苦苦掙扎，而是問問自己：「一個健康的人會在這個時候吃這個東西嗎？」這個簡單的問題會立刻啟動你的身份認同，引導你做出正確的選擇。\n\n接著，作者為我們拆解了習慣的四大步驟：提示、渴望、回應和獎賞。這四個步驟形成了一個循環。要建立一個好習慣，就要針對這四個步驟進行科學化的環境與大腦設計。首先是讓提示「顯而易見」。書中講述了英國自由車國家隊的傳奇故事。在二零零三年以前的近百年裡，英國自行車隊幾乎沒有贏過任何像樣的比賽，在奧運會上也只拿過一枚金牌，甚至連知名自行車製造商都拒絕把車賣給他們，害怕影響品牌形象。但新教練戴夫·布萊爾斯福德上任後，實施了「邊際效益的微小加總」策略。他們沒有做什麼驚天動地的大動作，而是從小處著手：他們測試了各種不同的按摩凝膠，看哪一種能讓肌肉最快復原；他們為每位隊員挑選最適合的睡枕和床墊，確保每天晚上都有完美的深度睡眠；他們甚至把車隊卡車的內部漆成純白色，這樣就能輕易發現任何微小的灰塵，避免這些灰塵進入精密的賽車部件，影響車況。這些看似微不足道的百分之一的改進，單看每一項都毫無意義，但當幾十個百分之一加總起來，奇蹟就發生了。英國國家隊在短短幾年內橫掃了環法自行車賽，並在奧運會上拿下了高達六成的公路賽金牌。這就是系統的力量，讓提示與細節完全為目標服務。\n\n其次，我們要善用「兩分鐘法則」來打破起步的阻力。很多人之所以無法堅持運動，是因為一想到要在下班後去健身房運動一小時，意志力就直接崩潰了。作者分享了他自己的經驗：當你要開始一個新的習慣時，它在初期應該被簡化到可以在兩分鐘內完成。比如把「每天讀書一小時」簡化為「讀書一頁」；把「每天跑步十公里」簡化為「換上運動鞋，走出大門並繫好鞋帶」。一旦你穿好鞋子走到戶外，前進的慣性就已經啟動了，後續去散步或跑一下步就變得順理成章。因為你每天都在重複「出門」這個動作，這個習慣就深深烙印在你的系統裡。\n\n另外，我們還要重新規劃我們的物理生活空間。大腦其實非常偷懶，如果提示就在眼前，我們就會去做。比如，如果你想培養每天喝水的習慣，就不要把水壺藏在櫥櫃裡，而是要在你工作的辦公桌上擺放三個裝滿水的玻璃杯，讓提示無處不在；如果你想培養讀書習慣，今晚睡前，就把你要讀的那本書直接翻開，平放在你的枕頭中央或床頭櫃上。\n\n很多時候，我們總是對自己太苛刻，總想著一步登天。但其實，人生是一場漫長的馬拉松，而不是短跑。那些真正改變我們一生的力量，往往隱藏在我們最不起眼的日常細節中。今天晚上，不妨就給自己安排一個兩分鐘的小實驗吧。決定一個你一直想建立的習慣，把它拆解成兩分鐘的版本，然後在你的生活環境中，為它創造一個顯而易見的實體提示。希望這個微小的實驗能帶給你力量，不要給自己太大的壓力，每天進步一點點就好。願你今晚有個好夢，我們下次聊。"
    },
    "deep-work": {
        title: "深度工作力",
        author: "Cal Newport",
        highlight: "在充斥干擾的現代世界中，專注的深度工作力不是一項裝飾性技能，而是決定你能否存活並脫穎而出的核心超能力。",
        pain: "一整天被即時通訊軟體、電子郵件與無止盡的會議轟炸，感覺無比忙碌，但到了下班卻發現自己一件真正有價值的大事都沒做完。",
        solve: "透過主動排除外在干擾，將大腦調整至無干擾的高專注狀態，實現認知產能的指數級飛躍，快速學習複雜事物並產出高品質成果。",
        takeaways: [
            {
                title: "深度工作與淺層工作的本質差異及「注意力殘留」",
                theory: "深度工作是在無干擾狀態下進行的專注職業活動，能將你的認知能力推向極限，創造新價值並難以被複製。淺層工作則是行政、回覆訊息等低認知負擔且具事務性的工作，容易被自動化或外包。現代人頻繁在任務間切換，即使只是看一眼手機，大腦會產生「注意力殘留」，大幅降低後續核心工作的思考效率。",
                case: "心理學家尼爾·雷赫姆（Neal Roese）的研究指出，當人頻繁切換工作（例如寫報告時看一眼 Line 訊息），即使你立刻轉回寫報告，大腦仍有一部分在思考剛才的訊息內容。這種「注意力殘留」會導致認知效率下降高達 20%，使人處於半昏睡的混亂思考狀態。"
            },
            {
                title: "深度工作的四種時間管理策略",
                theory: "要進入深度工作狀態，不能單靠意志力，必須建立固定的「儀式感」。作者提出了四種時間調配策略：修道院式（完全與世隔絕）、雙峰式（將時間清晰劃分為深度工作週/淺層週）、節奏式（每天固定時間深度工作）、或新聞記者式（隨時隨地切換進入專注）。選擇適合自己生活節奏的策略是維持專注的關鍵。",
                case: "著名理論物理學家理查·費曼（Richard Feynman）為了保護自己的深度工作時間，主動拒絕了大學裡幾乎所有的行政職務與委員會職位。他曾公開表示，自己故意表現得「不負責任且懶於行政」，就是為了確保自己有大塊、不被打擾的時間來思考宇宙最深奧的物理規律。"
            },
            {
                title: "擁抱無聊與遠離社群媒體",
                theory: "現代人的大腦已經習慣了隨時隨地的低成本多巴胺刺激（如滑手機）。如果不訓練大腦「容忍無聊」，在需要深度專注時，大腦就會像戒毒般焦躁。我們必須主動安排「不滑手機的時間段」，重新訓練專注神經。此外，應從「工具箱思維」評估社群網路對核心人生與工作目標的真實貢獻，而非僅因其好玩就使用。",
                case: "暢銷書作家芭芭拉·歐克莉（Barbara Oakley）在寫作時，會使用特殊的瀏覽器阻斷器，將自己與外界徹底切斷。她指出，大腦的神經網絡需要一段安靜無干擾的時間才能建立深層聯結，頻繁的即時反饋會摧毀大腦建構複雜邏輯的能力。"
            }
        ],
        action_title: "上午專注沙盒實驗",
        action_desc: "明天早上開始工作的前 90 分鐘，將自己置於「沙盒狀態」，徹底切斷所有通訊干擾，專注於一件需要高度思考的困難任務。",
        action_steps: [
            "下班前或今晚，決定好明天早上前 90 分鐘要做的「那一件深度工作任務」（一定要是具挑戰性的核心事務）。",
            "明天一早，將手機開啟飛航模式並放進抽屜或另一個房間，避免視覺誘惑。",
            "關閉電腦上所有的通訊軟體、郵件通知，且只留下一個與工作相關的網頁分頁。",
            "連續專注工作 90 分鐘，期間不回覆任何訊息、不查看任何網頁。若想休息，僅能閉目養神，不可滑手機。"
        ],
        podcast_script: "嗨，今天下班後，你感覺累了嗎？想跟你聊聊一種我們每天都在經歷的疲憊。不知道你有沒有過這種感覺：一整天下來，你好像一刻也沒有閒著。你不停地在 Line 和 Slack 上回覆訊息，每隔幾分鐘就收一次信箱，參加了一個接一個的會議。你感覺自己無比忙碌，像是公司裡最核心的齒輪。可是到了下班前，當你坐在辦公桌前，冷靜地回想這一天，卻突然感到一陣空虛。原因你發現，自己那件真正需要動腦、需要產出高品質成果的大事，竟然連一行都沒有寫，甚至根本還沒開始。\n\n如果你有這種感覺，我想告訴你，你並不孤單。卡爾·紐波特在《深度工作力》這本書中，為我們指出了這個時代的集體痛點：我們正在失去「深度工作」的能力，而被無止盡的「淺層工作」所淹沒。淺層工作指的是回郵件、處理行政雜務、回覆即時訊息，這些工作的特點是低認知需求、重複性高，而且極易被複製或外包；而深度工作，則是在完全沒有干擾的狀態下，專注於一項高認知需求的挑戰，這能將你的大腦認知能力推向極限，創造出真正難以被複製的價值。\n\n為什麼我們頻繁在工作和手機訊息之間切換，會讓我們變得這麼累且沒有產出？書中提到了一個非常重要心理學概念，叫做「注意力殘留」。心理學家尼爾·雷赫姆的研究指出，當我們從撰寫報告切換去看一眼 Line 的新訊息，即使只是看了一眼，隨後立刻轉回寫報告，我們的大腦並沒有真正完全切換回來。大腦的一部分還在處理剛才訊息的內容，這就是注意力殘留。這種頻繁的任務切換，會導致我們的認知效率下降高達百分之二十，使我們處於一種半昏睡的混亂思考狀態。\n\n那麼，我們要如何重獲這項專注的超能力呢？作者提出了四種時間調配策略。第一種是「修道院式」，完全與世隔絕；第二種是「雙峰式」，將時間清晰劃分，比如這週專門深度工作，下週處理雜務；第三種是「節奏式」，每天固定一段時間深度工作；第四種是「新聞記者式」，利用碎片時間隨時切換。對於大部分人來說，每天固定時間的「節奏式」是最容易落實的。\n\n而要維持這種節奏，不能單靠脆弱的意志力，必須建立固定的「儀式感」來保護你的時間。著名理論物理學家理查·費曼為了保護自己的深度工作時間，採取了一個看似極端的作法。他主動拒絕了大學裡幾乎所有的行政職務和委員會職位。他甚至故意對學校的管理層表現出「不負責任且懶於行政」的態度，讓大家覺得他根本不適合做這些雜事。費曼這麼做，就是為了確保自己每天有大塊、不被打擾的時間，能夠安靜地坐在書桌前，思考宇宙最深奧的物理規律。\n\n另外，我們還必須主動訓練大腦「擁抱無聊」。現代人的大腦已經習慣了隨時隨地的低成本多巴胺刺激（比如每隔幾分鐘就滑一次手機）。如果不訓練大腦容忍無聊，在需要深度專注時，大腦就會像戒毒般焦躁不安。我們必須主動安排「不滑手機的時間段」，重新訓練專注神經。\n\n今天晚上，讓我們一起來規劃一場「上午專注沙盒實驗」吧。明天早上開始工作的前九十分鐘，將自己置於「沙盒狀態」：把手機調成飛航模式並放進抽屜，關掉電腦上所有的即時通訊軟體與信箱通知，且只留下一個工作網頁。連續專注工作九十分鐘，期間不回覆任何訊息。不要害怕錯過什麼，相信我，這世界不會因為你消失九十分鐘而停轉。希望這個實驗能幫你找回專注的平靜。願你今晚有個好夢，我們下次聊。"
    },
    "thinking": {
        title: "快思慢想",
        author: "Daniel Kahneman",
        highlight: "我們大腦的直覺判斷既是無價的生存工具，也是精準誘騙我們犯下系統性謬誤的思維陷阱。",
        pain: "在面臨決策、投資或評估他人時，經常憑藉「第一直覺」做決定，事後卻發現被表象與認知偏誤所欺騙，付出慘痛的決策代價。",
        solve: "理解人類大腦「系統 1」（直覺、快速）與「系統 2」（理性、慢速）的協作機制，學會識別並防範思維偏誤，在重要關頭啟動理性的慢想決策。",
        takeaways: [
            {
                title: "系統 1（快思）與系統 2（慢想）的雙系統運作機制",
                theory: "系統 1 運作自動且快速，依賴直覺、聯想與 experience，耗能極低且無法關閉；系統 2 則負責邏輯思考、複雜運算與自我控制，耗能極高且天性懶惰。多數時候系統 2 會直接同意系統 1 的直覺決定以節省能量，這導致我們在不知不覺中掉入偏誤。當遇到需要精密計算或重要決策時，必須主動調用系統 2 來接管大腦。",
                case: "著名的「球棒與球問題」：一隻球棒和一個球共計 1.10 美元，球棒比球貴 1.00 美元，請問球多少錢？大腦的系統 1 會立刻給出直覺答案「0.10 美元」。然而，只要啟動懶惰的系統 2 進行簡單驗算（1.05 + 0.05 = 1.10），就會發現正確答案是「0.05 美元」。這個經典實驗證明了即使是頂尖大學高材生，也極易被系統 1 的直覺所蒙蔽。"
            },
            {
                title: "錨定效應與可得性捷思法",
                theory: "「錨定效應」是指人的決策容易受到最初接收到的無關數字（錨）的影響，圍繞該錨點進行微幅調整；「可得性捷思」則是人們傾向以大腦中最容易想到的例子或最新發生的深刻事件，來評估事情發生的機率。這兩大思維捷徑使我們極易被隨機數據與新聞媒體的誇大報導所左右。",
                case: "丹尼爾·康納曼在聯合國做過一個實驗：他先在受試者面前旋轉一個幸運輪盤，輪盤指針停在 10 或 65。接著他問受試者：「非洲國家在聯合國席位中所佔的比例，高於還是低於輪盤上的數字？」隨後要求估計具體比例。結果發現，輪盤轉到 10 的組別，估計平均值為 25%；而轉到 65 的組別，估計平均值高達 45%。輪盤上的隨機數字成為了強力的錨，扭曲了人們的理性判斷。"
            },
            {
                title: "展望理論與損失規避心態",
                theory: "傳統經濟學認為人是理性的，但康納曼提出的「展望理論」證明，人類對「損失」的痛苦感受，遠大於對「獲得」的快樂感受（通常痛苦度是快樂度的兩倍，即損失規避率為 2:1）。這導致我們在面對虧損時傾向冒險以求扳回本金（如套牢不賣），而在面對獲利時傾向保守落袋為安，做出不符合最大利益的決策。",
                case: "康納曼設計了一個拋硬幣實驗：如果是反面，你將損失 100 美元；如果是正面，你必須贏得多少美元，你才願意接受這個賭局？實驗結果顯示，大多數受試者要求正面贏得的金額至少要達 200 美元（損失 the double），才願意參與。這證明了「損失規避」根植於我們大腦底層的避險機制。"
            }
        ],
        action_title: "反思決策減速計畫",
        action_desc: "在明天遇到需要做重要決定或評估（如開會表決、購買高單價物品）時，刻意按下直覺暫停鍵，用邏輯驗算與雙向思考來對沖大腦的錨定效應與直覺偏誤。",
        action_steps: [
            "在做決定前，深呼吸並問自己：「我現在的判斷，是否受到了第一個看到的價格、數字或第一印象（錨）的影響？」",
            "拿出一張紙，寫下支持該決定的 3 個理由，以及反對該決定的 3 個理由，強迫啟動系統 2 進行理性分析。",
            "尋求一位與你觀點相反的同事或朋友的意見，以破解自己大腦中的「可得性偏誤」與確認偏誤。"
        ],
        podcast_script: "嗨，今天過得好嗎？想跟你聊聊我們每天都在做的「決定」。不論是買一件衣服、投資一個項目，還是評估一個剛認識的人，我們常常會對自己的「直覺」感到無比自信，覺得自己是個理性且精明的人。但你是否也曾有過這樣的經歷：憑藉著第一眼的好印象做出了重大決定，事後卻發現自己被表象給欺騙了，付出了慘痛的代價，才後悔自己當時怎麼會那麼糊塗？\n\n諾貝爾經濟學獎得主丹尼爾·康納曼在《快思慢想》這本書中，為我們揭開了大腦運作的神秘面紗。他指出，我們的大腦其實有兩套思維系統在協作，他稱之為「系統一」和「系統二」。系統一就是我們的「直覺」，它的運作是自動且極速的，幾乎不消耗任何能量，而且無法被關閉，比如當你看到一張生氣的臉，或者遇到危險時本能地躲避，這都是系統一的功勞；而系統二則是我們的「理性」，負責邏輯思考、複雜運算與自我控制，它的運作非常緩慢，需要消耗大量的能量，而且它非常懶惰。\n\n大多數時候，大腦為了節省能量，系統二會直接同意系統一的直覺決定。這導致我們在不知不覺中掉入了無數個系統性思維偏誤中。書中提到一個非常經典且好玩的實驗，叫做「球棒與球問題」：一隻球棒和一個球共計一點一美元，球棒比球貴一美元，請問球多少錢？當你聽到這個問題時，大腦的系統一會立刻彈出直覺答案：「零點一美元（十美分）」。然而，只要你稍微啟動那懶惰的系統二，進行簡單的代數驗算：如果球是零點一美元，球棒比它貴一美元就是一點一美元，加起來就是一點二美元了。正確答案其實是「零點零五美元（五美分）」。這個實驗證明，即使是哈佛、普林斯頓等頂尖大學的高材生，大腦在多數時候也是極度偷懶，輕易被直覺所蒙蔽的。\n\n除了雙系統外，書中還揭露了非常強大的「錨定效應」。這指的是人的決策極易受到最初接收到的無關數字（錨點）的影響。康納曼在聯合國大會做過一個非常令人震驚的實驗：他讓受試者在旋轉幸運輪盤後，輪盤停在十或六十五這兩個隨機數字上。接著，他問受試者：「非洲國家在聯合國席位中所佔的比例，高於還是低於輪盤上的數字？」隨後要求估計具體比例。結果發現，輪盤轉到十的組別，估計平均值只有百分之二十五；而轉到六十五的組別，估計平均值卻高達百分之四十五！一個完全隨機、毫無關聯的數字，竟然像一艘船的鐵錨一樣，定死受試者大腦的理智思考。這就解釋了為什麼商家在打折時，要先標示一個高得離譜的原價，因為那個原價就是定死你大腦評估的「錨點」。\n\n我們對「損失」的敏感度也遠大於對「獲得」的快樂。康納曼的「展望理論」證明，人類對損失的痛苦感受，通常是獲得快樂的兩倍。這導致我們在股票套牢時不肯賣出，在獲利時又急於套現，做出了不符合最大利益的決策。\n\n在生活中，直覺是無價的生存工具，但當面對重大決策時，我們必須學會踩下煞車。明天在做任何重要決定前，不妨給自己安排一個「反思決策減速計畫」：在做決定前暫停三秒，問問自己：「我現在的判斷是否受到了第一個數字或第一印象的錨定？」然後拿出一張紙，強迫自己寫下支持與反對的各三個理由。這能強迫你那懶惰的系統二接管思考，做出更理性的選擇。希望這個小小的改變能讓你的思維更清晰。願你今晚有個好夢，我們下次聊。"
    }
};

// Global App State
const state = {
    selectedFile: null,
    parsedText: "",
    extractedData: null,
    podcastScript: "",
    chunks: [], // Text chunks corresponding to audio chunks
    currentChunkIndex: 0,
    isPlaying: false,
    apiKey: localStorage.getItem("gemini_api_key") || "",
    model: localStorage.getItem("gemini_model") || "gemini-2.0-flash",
    temperature: parseFloat(localStorage.getItem("gemini_temperature")) || 0.3,
    customPromptEnabled: localStorage.getItem("gemini_custom_prompt_enabled") === "true",
    customPrompt: localStorage.getItem("gemini_custom_prompt") || ""
};

// Default System Prompts
const DEFAULT_SYSTEM_PROMPT = `你是一位擁有敏銳洞察力的頂級圖書說書人與 Podcast 製作人。你的任務是閱讀以下整本書籍的文本，並將其精煉為一份高含金量、結構清晰的書籍精華大綱，為接下來製作 10 分鐘的 Podcast 腳本做準備。

請幫我從文本中萃取並整理出以下四個核心區塊，內容必須扎實、拒絕空泛的形容詞，多保留書中的具體案例、數據或實驗。

你必須以 JSON 格式回覆，格式如下，不要包含 markdown 標記以外的多餘文字，以確保解析正確。

{
  "highlight": "一句話亮點：用一句充滿懸念或震撼力的話，總結這本書的核心價值。",
  "pain": "痛點共鳴：這本書試圖解決現代人的什麼問題？（驅動聽眾想聽下去的動機）",
  "solve": "這本書提供的核心解藥：針對上述痛點的總體解決方案。",
  "takeaways": [
    {
      "title": "觀點一標題",
      "theory": "詳細理論/邏輯解釋",
      "case": "書中具體故事或案例細節，請盡量詳細保留"
    },
    {
      "title": "觀點二標題",
      "theory": "詳細理論/邏輯解釋",
      "case": "書中具體故事或案例細節，請盡量詳細保留"
    },
    {
      "title": "觀點三標題",
      "theory": "詳細理論/邏輯解釋",
      "case": "書中具體故事或案例細節，請盡量詳細保留"
    }
  ],
  "action_title": "行動指南標題（明天一早馬上可以實踐的一個具體改變或小實驗名稱）",
  "action_desc": "具體改變或小實驗的詳細說明",
  "action_steps": [
    "步驟一...",
    "步驟二...",
    "步驟三..."
  ]
}

約束：
- 必須完全基於提供的文本內容，不得捏造書中沒有的案例。
- 每個觀點的案例細節請盡量詳細保留，這將是 Podcast 吸引人的關鍵。
- 語言：繁體中文。`;

const PODCAST_SYSTEM_PROMPT = `你是一位卓越的說書 Podcast 主持人與製作人。請根據以下書籍的大綱資訊，直接為我撰寫一份專供 Podcast 朗讀的「說書人單人講稿（腳本）」，播客音訊長度需要達到 10-15 分鐘左右，因此字數必須非常充足（約 2200 - 3000 字左右）。
請使用「繁體中文」，口語生動、具感染力、充滿畫面感，不要包含音效指示等任何非口語文字。

請嚴格遵守以下開頭與結尾規則：
1. 開頭禁忌：絕對不可使用「大家好，我是說書人...」或「歡迎收聽本期播客」等任何公式化的套話。請使用溫慢、親切的互動方式開頭，像是一位懂你的老朋友在咖啡廳跟你坐下來分享生活心得（例如：「嗨，今天過得好嗎？想跟你聊聊一個我們都經歷過的事...」、「你今天累了嗎？我剛讀了一本書...」）。
2. 結尾禁忌：絕對不可使用「我是說書人，我們下週再見！」或「謝謝收聽，別忘了訂閱」等公式化結尾。請以溫馨、啟發且非常自然的方式收尾（例如：「希望這個微小的實驗能帶給你力量，願你今晚有個好夢，我們下次聊。」）。

內容結構與字數分配：
- 吸引人的親切開頭 (Hook, 約 300-400 字)：引出聽眾日常工作或生活的痛點，並用書中的一句話亮點勾起興趣。
- 核心觀點深度展開 (Body, 約 1600-2200 字)：逐一深入解析書中的 3 個核心觀點。為了保證長度達到 10-15 分鐘，請將書中的每個案例、故事、科學實驗、數據背景「極盡詳細」地還原並展開敘述，多用生動的細節描繪，避免抽象空洞。
- 溫馨結尾與行動指南 (Outro, 約 300-400 字)：提出一個明天早上聽眾立刻可以嘗試的具體小實驗，並以老朋友般溫暖自然的口吻道別。`;

// Audio Node Reference
const audio = document.getElementById("podcast-audio");

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    // Render Icons
    lucide.createIcons();

    // Load Saved Settings into UI
    initSettingsUI();

    // Bind Event Listeners
    bindEvents();

    // Update active badges based on settings
    updateBadgeStatus();
});

// Load settings into input fields
function initSettingsUI() {
    // Migrate deprecated models
    if (state.model === "gemini-1.5-flash") {
        state.model = "gemini-2.0-flash";
        localStorage.setItem("gemini_model", state.model);
    } else if (state.model === "gemini-1.5-pro") {
        state.model = "gemini-2.0-pro";
        localStorage.setItem("gemini_model", state.model);
    }

    document.getElementById("api-key-input").value = state.apiKey;
    document.getElementById("model-select").value = state.model;
    document.getElementById("temperature-slider").value = state.temperature;
    document.getElementById("temp-val").textContent = state.temperature;

    const customizeCheckbox = document.getElementById("customize-prompt-checkbox");
    customizeCheckbox.checked = state.customPromptEnabled;

    const promptContainer = document.getElementById("custom-prompt-container");
    if (state.customPromptEnabled) {
        promptContainer.classList.remove("hidden");
    } else {
        promptContainer.classList.add("hidden");
    }

    if (!state.customPrompt) {
        state.customPrompt = DEFAULT_SYSTEM_PROMPT;
    }
    document.getElementById("system-prompt-textarea").value = state.customPrompt;
}

// Bind UI Events
function bindEvents() {
    const settingsBtn = document.getElementById("toggle-settings-btn");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const settingsCard = document.getElementById("api-settings-card");
    const inputCard = document.getElementById("input-source-card");

    // Drawer Toggles
    settingsBtn.addEventListener("click", () => {
        settingsCard.classList.remove("hidden");
    });

    closeSettingsBtn.addEventListener("click", () => {
        settingsCard.classList.add("hidden");
    });

    // Toggle API Key Visibility
    const toggleKeyBtn = document.getElementById("toggle-api-key-visibility");
    const keyInput = document.getElementById("api-key-input");
    toggleKeyBtn.addEventListener("click", () => {
        const type = keyInput.type === "password" ? "text" : "password";
        keyInput.type = type;
        const iconName = type === "password" ? "eye" : "eye-off";
        toggleKeyBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        lucide.createIcons({ attrs: { class: 'lucide' } });
    });

    // Save Settings Button
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    saveSettingsBtn.addEventListener("click", () => {
        state.apiKey = document.getElementById("api-key-input").value.trim();
        state.model = document.getElementById("model-select").value;
        state.temperature = parseFloat(document.getElementById("temperature-slider").value);
        state.customPromptEnabled = document.getElementById("customize-prompt-checkbox").checked;
        state.customPrompt = document.getElementById("system-prompt-textarea").value;

        localStorage.setItem("gemini_api_key", state.apiKey);
        localStorage.setItem("gemini_model", state.model);
        localStorage.setItem("gemini_temperature", state.temperature);
        localStorage.setItem("gemini_custom_prompt_enabled", state.customPromptEnabled);
        localStorage.setItem("gemini_custom_prompt", state.customPrompt);

        updateBadgeStatus();
        showToast("設定已存檔！", "check-circle");
        settingsCard.classList.add("hidden");
    });

    // Temperature Slider Value Update
    const tempSlider = document.getElementById("temperature-slider");
    tempSlider.addEventListener("input", (e) => {
        document.getElementById("temp-val").textContent = e.target.value;
    });

    // Customize Prompt Checkbox Toggle
    const customizePromptCheckbox = document.getElementById("customize-prompt-checkbox");
    const promptContainer = document.getElementById("custom-prompt-container");
    customizePromptCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            promptContainer.classList.remove("hidden");
        } else {
            promptContainer.classList.add("hidden");
        }
    });

    // Tab Switching - Source Inputs
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const targetTab = btn.getAttribute("data-tab");
            document.querySelectorAll(".tab-pane").forEach(pane => {
                pane.classList.remove("active");
            });
            document.getElementById(targetTab).classList.add("active");
            validateInputState();
        });
    });

    // Tab Switching - Result Output Tabs
    const resultTabButtons = document.querySelectorAll(".result-tab-btn");
    resultTabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            resultTabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const targetTab = btn.getAttribute("data-result-tab");
            document.querySelectorAll(".result-tab-pane").forEach(pane => {
                pane.classList.remove("active");
            });
            document.getElementById(targetTab).classList.add("active");
        });
    });

    // Paste Text Count
    const pasteArea = document.getElementById("raw-text-input");
    pasteArea.addEventListener("input", (e) => {
        const text = e.target.value;
        document.getElementById("char-count").textContent = text.length.toLocaleString();
        state.parsedText = text;
        validateInputState();
    });

    // Drag and Drop Files
    const dropZone = document.getElementById("drag-drop-zone");
    const fileInput = document.getElementById("file-input");

    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Remove File Button
    document.getElementById("remove-file-btn").addEventListener("click", () => {
        state.selectedFile = null;
        state.parsedText = "";
        fileInput.value = "";
        document.getElementById("file-info-bar").classList.add("hidden");
        dropZone.classList.remove("hidden");
        validateInputState();
    });

    // Sample Books Grid Selection
    const sampleCards = document.querySelectorAll(".sample-card-btn");
    sampleCards.forEach(card => {
        card.addEventListener("click", () => {
            sampleCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            validateInputState();
        });
    });

    // Agent 01 Button Trigger
    document.getElementById("start-extract-btn").addEventListener("click", () => {
        triggerAgent01Extraction();
    });

    // Agent 02 Button Trigger
    document.getElementById("start-podcast-btn").addEventListener("click", () => {
        triggerAgent02PodcastGeneration();
    });

    // Output Action: Copy Markdown
    document.getElementById("copy-markdown-btn").addEventListener("click", () => {
        if (!state.extractedData) return;
        const mdText = formatDataToMarkdown(state.extractedData);
        navigator.clipboard.writeText(mdText).then(() => {
            showToast("大綱 Markdown 已複製至剪貼簿！", "clipboard-check");
        }).catch(() => {
            showToast("複製失敗，請手動選取複製。", "alert-triangle");
        });
    });

    // Output Action: Download Markdown
    document.getElementById("download-markdown-btn").addEventListener("click", () => {
        if (!state.extractedData) return;
        const mdText = formatDataToMarkdown(state.extractedData);
        const filename = `${state.extractedData.title || "書籍大綱"}_精華大綱.md`;
        triggerDownload(mdText, filename, "text/markdown");
    });

    // Output Action: Download Script
    document.getElementById("download-script-btn").addEventListener("click", () => {
        if (!state.podcastScript) return;
        const title = state.extractedData?.title || "說書播客";
        triggerDownload(state.podcastScript, `${title}_播客逐字稿.txt`, "text/plain");
    });

    // Audio Player Controls
    const playBtn = document.getElementById("player-btn-play");
    const stopBtn = document.getElementById("player-btn-stop");
    const prevBtn = document.getElementById("player-btn-prev");
    const nextBtn = document.getElementById("player-btn-next");
    const progressBg = document.getElementById("player-progress-bg");

    playBtn.addEventListener("click", () => {
        if (state.chunks.length === 0) return;
        if (state.isPlaying) {
            pausePodcastAudio();
        } else {
            playPodcastAudio();
        }
    });

    stopBtn.addEventListener("click", () => {
        stopPodcastAudio();
    });

    prevBtn.addEventListener("click", () => {
        if (state.chunks.length === 0) return;
        const targetIndex = Math.max(0, state.currentChunkIndex - 1);
        playChunkAtIndex(targetIndex);
    });

    nextBtn.addEventListener("click", () => {
        if (state.chunks.length === 0) return;
        const targetIndex = Math.min(state.chunks.length - 1, state.currentChunkIndex + 1);
        playChunkAtIndex(targetIndex);
    });

    audio.addEventListener("ended", () => {
        if (state.isPlaying) {
            if (state.currentChunkIndex < state.chunks.length - 1) {
                playChunkAtIndex(state.currentChunkIndex + 1);
            } else {
                stopPodcastAudio();
            }
        }
    });

    // Seek player
    progressBg.addEventListener("click", (e) => {
        if (!audio.duration) return;
        const rect = progressBg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = clickX / rect.width;
        audio.currentTime = ratio * audio.duration;
    });

    // Time update progress bar
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const cur = formatTime(audio.currentTime);
            const dur = formatTime(audio.duration);
            document.getElementById("player-time-current").textContent = cur;
            document.getElementById("player-time-duration").textContent = dur;

            const pct = (audio.currentTime / audio.duration) * 100;
            document.getElementById("player-progress").style.width = `${pct}%`;
        }
    });

    // Speed Selector change listener
    document.getElementById("player-speed-select").addEventListener("change", (e) => {
        audio.playbackRate = parseFloat(e.target.value);
    });
}

function triggerDownload(content, filename, contentType) {
    const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("檔案下載成功！", "download");
}

// Update Active Mode badges
function updateBadgeStatus() {
    const badge = document.getElementById("app-mode-badge");
    const textSpan = badge.querySelector(".badge-text");

    if (state.apiKey) {
        badge.className = "status-badge api-mode-active";
        textSpan.textContent = `API 實機模式 (${state.model})`;
    } else {
        badge.className = "status-badge live-mode-badge";
        textSpan.textContent = "展示模式 (Demo Mode)";
    }
}

// Enable/Disable main buttons based on input status
function validateInputState() {
    const activeTabBtn = document.querySelector(".tab-btn.active");
    const activeTab = activeTabBtn ? activeTabBtn.getAttribute("data-tab") : "";
    const startExtractBtn = document.getElementById("start-extract-btn");
    const startPodcastBtn = document.getElementById("start-podcast-btn");

    let isValid = false;

    if (activeTab === "tab-upload" && state.parsedText && state.selectedFile) {
        isValid = true;
    } else if (activeTab === "tab-paste" && state.parsedText.length > 50) {
        isValid = true;
    } else if (activeTab === "tab-samples") {
        const selectedSample = document.querySelector(".sample-card-btn.selected");
        if (selectedSample) isValid = true;
    }

    startExtractBtn.disabled = !isValid;
    startPodcastBtn.disabled = !isValid;
}

// Handle local file uploads (TXT or EPUB via JSZip)
async function handleFileSelection(file) {
    const dropZone = document.getElementById("drag-drop-zone");
    const fileInfoBar = document.getElementById("file-info-bar");
    const fileNameEl = document.getElementById("selected-file-name");
    const fileSizeEl = document.getElementById("selected-file-size");

    state.selectedFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatBytes(file.size);

    dropZone.classList.add("hidden");
    fileInfoBar.classList.remove("hidden");

    try {
        if (file.name.endsWith(".txt")) {
            // Read raw text file
            const reader = new FileReader();
            reader.onload = (e) => {
                state.parsedText = e.target.result;
                validateInputState();
            };
            reader.readAsText(file, "UTF-8");
        } else if (file.name.endsWith(".epub")) {
            // Read EPUB in browser
            state.parsedText = await parseEpubFile(file);
            validateInputState();
        } else {
            showToast("不支援的檔案格式，請上傳 .epub 或 .txt 檔案", "alert-triangle");
            // Reset
            document.getElementById("remove-file-btn").click();
        }
    } catch (err) {
        console.error("File parsing error:", err);
        showToast(`讀取檔案出錯: ${err.message}`, "alert-triangle");
        document.getElementById("remove-file-btn").click();
    }
}

// Client-side EPUB XHTML zip parser utilizing JSZip
async function parseEpubFile(file) {
    const zip = await JSZip.loadAsync(file);
    const containerXmlText = await zip.file("META-INF/container.xml").async("text");
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXmlText, "text/xml");
    const rootfile = containerDoc.querySelector("rootfile");
    const opfPath = rootfile.getAttribute("full-path");

    const opfText = await zip.file(opfPath).async("text");
    const opfDoc = parser.parseFromString(opfText, "text/xml");

    const items = {};
    opfDoc.querySelectorAll("manifest > item").forEach(item => {
        items[item.getAttribute("id")] = item.getAttribute("href");
    });

    const spine = [];
    opfDoc.querySelectorAll("spine > itemref").forEach(ref => {
        spine.push(ref.getAttribute("idref"));
    });

    const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
    let textContent = "";

    for (const idref of spine) {
        const href = items[idref];
        if (href) {
            const cleanPath = (opfDir + href).split("#")[0];
            const fileItem = zip.file(cleanPath);
            if (fileItem) {
                const htmlText = await fileItem.async("text");
                const htmlDoc = parser.parseFromString(htmlText, "text/html");
                const body = htmlDoc.querySelector("body") || htmlDoc.documentElement;
                const text = body.textContent || body.innerText || "";
                textContent += text + "\n\n";
            }
        }
    }

    return textContent.replace(/\s+/g, " ").trim();
}

// ==========================================================================
// Agent 01: Extract Outline Process
// ==========================================================================
async function triggerAgent01Extraction() {
    const activeTabBtn = document.querySelector(".tab-btn.active");
    const activeTab = activeTabBtn ? activeTabBtn.getAttribute("data-tab") : "";

    document.getElementById("empty-state-view").classList.add("hidden");
    document.getElementById("results-view").classList.add("hidden");

    const loadingView = document.getElementById("loading-state-view");
    loadingView.classList.remove("hidden");

    // Inject Agent 01 steps
    const stepsContainer = document.getElementById("loading-steps-container");
    stepsContainer.innerHTML = `
        <div class="loading-step active" id="step-1"><i data-lucide="loader"></i><span>分析並解析輸入內容</span></div>
        <div class="loading-step" id="step-2"><i data-lucide="circle"></i><span>分析痛點與核心概念</span></div>
        <div class="loading-step" id="step-3"><i data-lucide="circle"></i><span>AI 核心精華萃取大綱</span></div>
        <div class="loading-step" id="step-4"><i data-lucide="circle"></i><span>整理出實踐行動指南</span></div>
    `;
    lucide.createIcons();

    try {
        if (activeTab === "tab-samples") {
            const selectedCard = document.querySelector(".sample-card-btn.selected");
            const sampleKey = selectedCard.getAttribute("data-sample");
            const bookData = DEMO_BOOKS[sampleKey];

            await runLoadingSimulation(40);
            renderExtractedResults(bookData);
        } else {
            if (!state.apiKey) {
                showToast("未設定 API Key，請點擊 API 設定或使用經典範本！", "alert-triangle");
                loadingView.classList.add("hidden");
                document.getElementById("empty-state-view").classList.remove("hidden");
                return;
            }

            if (window.location.protocol === 'file:') {
                throw new Error("環境錯誤：在 file:/// 協議下無法發送 API 請求，請使用 Live Server 或本地伺服器開啟。");
            }

            updateLoadingStep(1, "running");
            // Simulate brief progress and send REST API call
            await sleep(500);
            updateLoadingStep(1, "completed");
            updateLoadingStep(2, "running");

            const maxChars = 40000;
            if (state.parsedText.length > maxChars) {
                showToast(`書籍長度較長，已自動截取前 ${maxChars.toLocaleString()} 字以防止 API 額度限制。`, "info");
            }
            const prompt = `${state.customPromptEnabled ? state.customPrompt : DEFAULT_SYSTEM_PROMPT}\n\n以下是書籍內容：\n${state.parsedText.substring(0, maxChars)}`;
            const responseText = await requestGemini(prompt, true);

            updateLoadingStep(2, "completed");
            updateLoadingStep(3, "running");

            const parsedJson = parseJsonSafe(responseText);

            updateLoadingStep(3, "completed");
            updateLoadingStep(4, "running");
            await sleep(500);
            updateLoadingStep(4, "completed");

            renderExtractedResults(parsedJson);
        }

        // Switch to Outline tab
        document.getElementById("btn-tab-outline").click();

        // Hide loader, show results
        loadingView.classList.add("hidden");
        document.getElementById("results-view").classList.remove("hidden");
        showToast("精華大綱萃取完成！", "check-circle");

    } catch (err) {
        console.error("Agent 01 error:", err);
        showToast(`萃取失敗: ${err.message}`, "alert-triangle");
        loadingView.classList.add("hidden");
        document.getElementById("empty-state-view").classList.remove("hidden");
    }
}

// Render Agent 01 structured results
function renderExtractedResults(data) {
    state.extractedData = data;

    // Set Header
    document.getElementById("result-book-title-outline").textContent = data.title || "書籍精華大綱";
    document.getElementById("result-book-title-podcast").textContent = `說書播客 - 《${data.title || "書籍"}》`;

    // Highlight text
    document.getElementById("result-highlight-text").textContent = data.highlight || "無一句話亮點";

    // Pain & Solve
    document.getElementById("result-pain-description").textContent = data.pain || "無痛點分析";
    document.getElementById("result-solve-description").textContent = data.solve || "無核心解藥";

    // Takeaways
    const takeawaysContainer = document.getElementById("result-takeaways-container");
    takeawaysContainer.innerHTML = "";

    const takeawaysList = data.takeaways || [];
    takeawaysList.forEach((takeaway, idx) => {
        const card = document.createElement("div");
        card.className = "takeaway-card";
        card.innerHTML = `
            <div class="takeaway-header">
                <span class="takeaway-num">0${idx + 1}</span>
                <span class="takeaway-title">${takeaway.title}</span>
                <span class="takeaway-chevron"><i data-lucide="chevron-down"></i></span>
            </div>
            <div class="takeaway-body">
                <p class="takeaway-theory">${takeaway.theory}</p>
                <div class="takeaway-case-box">
                    <div class="takeaway-case-title">書中故事 / 案例 / 實驗</div>
                    <div class="takeaway-case-desc">${takeaway.case}</div>
                </div>
            </div>
        `;
        takeawaysContainer.appendChild(card);
    });

    // Action Guide
    document.getElementById("result-action-title").textContent = data.action_title || "今日改變";
    document.getElementById("result-action-desc").textContent = data.action_desc || "具體執行內容";

    const checklistContainer = document.getElementById("result-action-checklist");
    checklistContainer.innerHTML = "";

    const steps = data.action_steps || [];
    steps.forEach((stepText) => {
        const item = document.createElement("div");
        item.className = "checklist-item";
        item.innerHTML = `
            <div class="checkbox-btn"><i data-lucide="check"></i></div>
            <div class="checkbox-text">${stepText}</div>
        `;
        item.addEventListener("click", () => {
            item.classList.toggle("completed");
        });
        checklistContainer.appendChild(item);
    });

    lucide.createIcons();

    // Enable/Disable download mp3 since we generated a new outline
    document.getElementById("download-mp3-btn").disabled = true;
}

// ==========================================================================
// Agent 02: Generate Podcast Process
// ==========================================================================
async function triggerAgent02PodcastGeneration() {
    const activeTabBtn = document.querySelector(".tab-btn.active");
    const activeTab = activeTabBtn ? activeTabBtn.getAttribute("data-tab") : "";

    document.getElementById("empty-state-view").classList.add("hidden");
    document.getElementById("results-view").classList.add("hidden");

    const loadingView = document.getElementById("loading-state-view");
    loadingView.classList.remove("hidden");

    // Inject Agent 02 steps
    const stepsContainer = document.getElementById("loading-steps-container");
    stepsContainer.innerHTML = `
        <div class="loading-step active" id="step-1"><i data-lucide="loader"></i><span>分析並解析輸入內容</span></div>
        <div class="loading-step" id="step-2"><i data-lucide="circle"></i><span>AI 撰寫口語 Podcast 逐字稿</span></div>
        <div class="loading-step" id="step-3"><i data-lucide="circle"></i><span>合成播客音訊</span></div>
        <div class="loading-step" id="step-4"><i data-lucide="circle"></i><span>加載播放與同步字幕</span></div>
    `;
    lucide.createIcons();

    try {
        let scriptText = "";
        let bookTitle = "";

        if (activeTab === "tab-samples") {
            const selectedCard = document.querySelector(".sample-card-btn.selected");
            const sampleKey = selectedCard.getAttribute("data-sample");
            const bookData = DEMO_BOOKS[sampleKey];

            await runLoadingSimulation(35);

            scriptText = bookData.podcast_script;
            bookTitle = bookData.title;

            // Render Agent 01 Outline too if not rendered yet
            if (!state.extractedData || state.extractedData.title !== bookTitle) {
                renderExtractedResults(bookData);
            }
        } else {
            if (!state.apiKey) {
                showToast("未設定 API Key，請點擊 API 設定或使用經典範本！", "alert-triangle");
                loadingView.classList.add("hidden");
                document.getElementById("empty-state-view").classList.remove("hidden");
                return;
            }

            if (window.location.protocol === 'file:') {
                throw new Error("環境錯誤：在 file:/// 協議下無法發送 API 請求，請使用 Live Server 或本地伺服器開啟。");
            }

            // If we don't have outline data yet, run Agent 01 first
            if (!state.extractedData) {
                updateLoadingStep(1, "running");
                const maxChars = 40000;
                if (state.parsedText.length > maxChars) {
                    showToast(`書籍長度較長，已自動截取前 ${maxChars.toLocaleString()} 字以防止 API 額度限制。`, "info");
                }
                const promptA1 = `${DEFAULT_SYSTEM_PROMPT}\n\n以下是書籍內容：\n${state.parsedText.substring(0, maxChars)}`;
                const responseA1 = await requestGemini(promptA1, true);
                state.extractedData = parseJsonSafe(responseA1);
                renderExtractedResults(state.extractedData);
                updateLoadingStep(1, "completed");
            } else {
                updateLoadingStep(1, "completed");
            }

            updateLoadingStep(2, "running");

            const promptA2 = `${PODCAST_SYSTEM_PROMPT}\n\n以下是 Agent 01 產出的書籍大綱資訊：\n${JSON.stringify(state.extractedData)}\n\n請根據大綱直接輸出完整主持人逐字稿（約 2200-3000 字），嚴禁使用任何公式套話。`;
            scriptText = await requestGemini(promptA2, false);
            bookTitle = state.extractedData.title;

            updateLoadingStep(2, "completed");
            updateLoadingStep(3, "running");
            await sleep(500);
            updateLoadingStep(3, "completed");
            updateLoadingStep(4, "running");
            await sleep(500);
            updateLoadingStep(4, "completed");
        }

        // Save Script
        state.podcastScript = scriptText;

        // Split script into paragraphs for chunked TTS on-demand loading
        const paragraphs = scriptText.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
        state.chunks = paragraphs;
        state.currentChunkIndex = 0;

        // Render Teleprompter elements
        const container = document.getElementById("teleprompter-content");
        container.innerHTML = paragraphs.map((p, idx) => `
            <div class="teleprompter-p" id="p-${idx}">${p}</div>
        `).join("");

        // Reset player UI
        stopPodcastAudio();
        document.getElementById("player-time-current").textContent = "0:00";
        document.getElementById("player-time-duration").textContent = "0:00";
        document.getElementById("player-progress").style.width = "0%";
        document.getElementById("player-status").textContent = "音訊加載完成，點擊播放開始收聽";

        // Enable download MP3 button
        document.getElementById("download-mp3-btn").disabled = false;

        // Switch to Podcast tab
        document.getElementById("btn-tab-podcast").click();

        // Hide loader, show results
        loadingView.classList.add("hidden");
        document.getElementById("results-view").classList.remove("hidden");
        showToast("播客音訊生成成功！", "check-circle");

    } catch (err) {
        console.error("Agent 02 error:", err);
        showToast(`音訊生成失敗: ${err.message}`, "alert-triangle");
        loadingView.classList.add("hidden");
        document.getElementById("empty-state-view").classList.remove("hidden");
    }
}

// Call Google Gemini REST Endpoint
async function requestGemini(prompt, isJson) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${state.apiKey}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: state.temperature
        }
    };
    if (isJson) {
        body.generationConfig.responseMimeType = "application/json";
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            let errorMsg = `HTTP 錯誤 ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error?.message || errorMsg;
            } catch (e) { /* Ignore parse error */ }

            if (response.status === 401 || response.status === 403) {
                throw new Error(`API Key 驗證失敗或無權限。請確認金鑰是否正確。詳細: ${errorMsg}`);
            } else if (response.status === 400) {
                throw new Error(`請求無效 (400)。請檢查 API Key 格式。詳細: ${errorMsg}`);
            }
            throw new Error(`Gemini API 請求失敗: ${errorMsg}`);
        }

        const resData = await response.json();
        return resData.candidates[0].content.parts[0].text;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error("網路連線失敗或跨域阻擋 (CORS)。請確認您使用的是 localhost (Live Server) 而非 file:///");
        }
        throw error;
    }
}

// Clean markdown wrapper around JSON
function parseJsonSafe(text) {
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.substring(7);
    }
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return JSON.parse(cleaned.trim());
}

// Animate loading items for demo mode/user feel
async function runLoadingSimulation(msPerTick) {
    const progressEl = document.getElementById("loader-progress-text");
    const steps = [
        { step: 1, val: 20 },
        { step: 2, val: 50 },
        { step: 3, val: 80 },
        { step: 4, val: 100 }
    ];

    for (const stepInfo of steps) {
        updateLoadingStep(stepInfo.step, "running");

        let currentPct = parseInt(progressEl.textContent) || 0;
        while (currentPct < stepInfo.val) {
            currentPct = Math.min(stepInfo.val, currentPct + 2);
            progressEl.textContent = `${currentPct}%`;

            // Animate SVG circular progress
            const ring = document.querySelector(".ring-fill");
            const dashoffset = 283 - (283 * currentPct) / 100;
            ring.style.strokeDashoffset = dashoffset;

            await sleep(msPerTick);
        }

        updateLoadingStep(stepInfo.step, "completed");
    }
}

function updateLoadingStep(stepNum, status) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    if (!stepEl) return;

    let icon = stepEl.querySelector("i, svg");
    const progressEl = document.getElementById("loader-progress-text");

    const newIcon = document.createElement("i");
    if (icon) {
        icon.parentNode.replaceChild(newIcon, icon);
        icon = newIcon;
    }

    if (status === "running") {
        stepEl.className = "loading-step active";
        icon.setAttribute("data-lucide", "loader");
        icon.className = "spinner-icon";
        document.getElementById("loading-status-title").textContent = stepEl.querySelector("span").textContent;
        const progressValues = { 1: 15, 2: 45, 3: 75, 4: 95 };
        progressEl.textContent = `${progressValues[stepNum]}%`;

        // Sync circle SVG
        const ring = document.querySelector(".ring-fill");
        ring.style.strokeDashoffset = 283 - (283 * progressValues[stepNum]) / 100;
    } else if (status === "completed") {
        stepEl.className = "loading-step completed";
        icon.setAttribute("data-lucide", "check-circle-2");
        icon.className = "";
    }

    lucide.createIcons({ attrs: { class: 'lucide' } });
}

// ==========================================================================
// Sequenced Paragraph TTS Player Engine
// ==========================================================================
function playChunkAtIndex(index) {
    if (index < 0 || index >= state.chunks.length) return;

    state.currentChunkIndex = index;

    // Highlight teleprompter paragraph
    document.querySelectorAll(".teleprompter-p").forEach(p => p.classList.remove("highlighted"));
    const activeP = document.getElementById(`p-${index}`);
    if (activeP) {
        activeP.classList.add("highlighted");
        // Scroll inside container
        const container = document.getElementById("teleprompter-content");
        container.scrollTop = activeP.offsetTop - container.offsetTop - (container.clientHeight / 2) + (activeP.clientHeight / 2);
    }

    const text = state.chunks[index];
    document.getElementById("player-status").textContent = `正在生成第 ${index + 1}/${state.chunks.length} 段語音...`;

    const voice = document.getElementById("player-voice-select").value;
    const speedSelect = document.getElementById("player-speed-select").value;

    // Map speed multiplier to edge-tts rate parameter
    let rate = "+10%";
    if (speedSelect === "0.8") rate = "-20%";
    if (speedSelect === "1.2") rate = "+20%";
    if (speedSelect === "1.5") rate = "+50%";

    // Determine the backend host dynamically to allow hosting the frontend on other ports (like VS Code Live Server) or via file:///
    const backendHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '8000'
        ? ''
        : 'http://localhost:8000';
    const ttsUrl = `${backendHost}/api/tts?text=${encodeURIComponent(text)}&voice=${voice}&rate=${encodeURIComponent(rate)}&pitch=%2B1Hz`;

    audio.src = ttsUrl;
    audio.playbackRate = parseFloat(speedSelect);

    audio.play().then(() => {
        state.isPlaying = true;
        document.querySelector(".audio-player-card").classList.add("playing");
        document.getElementById("player-btn-play").innerHTML = `<i data-lucide="pause"></i>`;
        lucide.createIcons({ attrs: { class: 'lucide' } });
        document.getElementById("player-status").textContent = `正在播放第 ${index + 1}/${state.chunks.length} 段...`;
    }).catch(err => {
        console.error("TTS chunk playback failed:", err);
        document.getElementById("player-status").textContent = `播放出錯: 請重試`;
    });
}

function playPodcastAudio() {
    if (state.chunks.length === 0) return;
    if (audio.src) {
        audio.play().then(() => {
            state.isPlaying = true;
            document.querySelector(".audio-player-card").classList.add("playing");
            document.getElementById("player-btn-play").innerHTML = `<i data-lucide="pause"></i>`;
            lucide.createIcons({ attrs: { class: 'lucide' } });
            document.getElementById("player-status").textContent = `正在播放第 ${state.currentChunkIndex + 1}/${state.chunks.length} 段...`;
        });
    } else {
        playChunkAtIndex(state.currentChunkIndex);
    }
}

function pausePodcastAudio() {
    audio.pause();
    state.isPlaying = false;
    document.querySelector(".audio-player-card").classList.remove("playing");
    document.getElementById("player-btn-play").innerHTML = `<i data-lucide="play"></i>`;
    lucide.createIcons({ attrs: { class: 'lucide' } });
    document.getElementById("player-status").textContent = "播放暫停";
}

function stopPodcastAudio() {
    audio.pause();
    audio.src = "";
    state.isPlaying = false;
    document.querySelector(".audio-player-card").classList.remove("playing");
    document.getElementById("player-btn-play").innerHTML = `<i data-lucide="play"></i>`;
    lucide.createIcons({ attrs: { class: 'lucide' } });
    document.getElementById("player-status").textContent = "播放已停止";
    state.currentChunkIndex = 0;

    document.getElementById("player-time-current").textContent = "0:00";
    document.getElementById("player-progress").style.width = "0%";

    document.querySelectorAll(".teleprompter-p").forEach(p => p.classList.remove("highlighted"));
    document.getElementById("teleprompter-content").scrollTop = 0;
}

// Helper to format structured object as markdown text
function formatDataToMarkdown(data) {
    let md = `# 《${data.title || "書籍名稱"}》精華與大綱大盤點\n\n`;
    md += `## 💡 一句話亮點\n> ${data.highlight}\n\n`;

    md += `## 🎯 痛點與解藥\n`;
    md += `* **聽眾痛點共鳴**：${data.pain}\n`;
    md += `* **書籍核心解藥**：${data.solve}\n\n`;

    md += `## 📚 三大核心觀點 (Core Takeaways)\n\n`;
    const takeaways = data.takeaways || [];
    takeaways.forEach((takeaway, idx) => {
        md += `### 觀點 ${idx + 1}：${takeaway.title}\n`;
        md += `* **理論邏輯深度解析**：${takeaway.theory}\n`;
        md += `* **書中具體故事 / 案例 / 實驗**：\n`;
        md += `  > ${takeaway.case}\n\n`;
    });

    md += `## 🎯 行動指南 (Actionable Step)\n\n`;
    md += `### 🎯 實踐小實驗：${data.action_title || "今日小改變"}\n`;
    md += `${data.action_desc}\n\n`;
    md += `**具體執行步驟：**\n`;
    const steps = data.action_steps || [];
    steps.forEach((step, idx) => {
        md += `${idx + 1}. [ ] ${step}\n`;
    });

    return md;
}

// Toast Notification Helper
function showToast(message, iconName = "info") {
    const toast = document.getElementById("toast");
    const icon = toast.querySelector(".toast-icon");
    const text = toast.querySelector(".toast-message");

    text.textContent = message;
    icon.innerHTML = `<i data-lucide="${iconName}"></i>`;
    lucide.createIcons({ attrs: { class: 'lucide' } });

    toast.classList.remove("hidden");

    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}

// Utility Helpers
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
