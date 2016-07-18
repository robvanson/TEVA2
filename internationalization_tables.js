var userLanguage = (navigator.language) ? navigator.language : navigator.userLanguage;
userLanguage = userLanguage.substr(0,2).toUpperCase();
console.log("["+userLanguage+"]");


function insert_and_update_options (labels) {
	for(x in labels) {
		if(document.getElementById(x) && ! x.match(/_/)) {
			document.getElementById(x).title = labels[x][1];
			var defaultText = document.getElementById(x+"Caption");
			if (defaultText) defaultText.textContent = labels[x][0];
			var defaultText2 = document.getElementById(x+"Caption2");
			if (defaultText2) defaultText2.textContent = labels[x][0];
		} else if (x.match(/_/)) {
			var Id = x.replace(/_[^_]*$/, "");
			var value = x.replace(/^[^_]*_/, "");
			if (document.getElementById(x)) {
				document.getElementById(x).value = value;
				document.getElementById(x).text = labels[x][0];
			} else {
				if(document.getElementById(Id)) {
					var selector = document.getElementById(Id);
					var newOption = selector.options[0].cloneNode(true);
					newOption.value = value;
					newOption.text = labels[x][0];
					newOption.id = x;
					selector.add(newOption);
				};
			};
		};
	};
};

function set_mainpageLanguage (language) {
	var labels = mainpage_tables[language];
	for(x in labels) {
		if(document.getElementById(x)) {
			document.getElementById(x).textContent = labels[x][0];
			document.getElementById(x).parentNode.parentNode.title = labels[x][1];
		};
	};
	
	labels = selector_tables[language];
	insert_and_update_options (labels);
	
	labels = language_table;
	insert_and_update_options (labels);
	
	// Set selector index
	if (document.getElementById("Language")) {
		for(var x = 0; x < document.getElementById("Language").options.length; ++ x) {
			if (document.getElementById("Language").options[x].value == language) {
				document.getElementById("Language").selectedIndex = x;
			};
		};
	};
	
	set_menuLanguage (language);
	
	valuelanguage =  JSON.stringify(language);
};

function set_menuLanguage (language) {
	var labels = menu_tables[language];
	for(x in labels) {
		if(document.getElementById(x)) {
			document.getElementById(x).label = labels[x][0];
			document.getElementById(x).title = labels[x][1];
		};
	};	
	valuelanguage = language;
};

function set_configLanguage (language) {
	var labels = config_tables[language];
	for(x in labels) {
		if(document.getElementById(x)) {
			document.getElementById(x).textContent = labels[x][0];
			document.getElementById(x).parentNode.parentNode.title = labels[x][1];
		};
	};
	
	labels = selector_tables[language];
	insert_and_update_options (labels);
	
	labels = language_table;
	insert_and_update_options (labels);
	
	// Set selector index
	for(var x = 0; x < document.getElementById("Language").options.length; ++ x) {
		if (document.getElementById("Language").options[x].value == language) {
			document.getElementById("Language").selectedIndex = x;
		};
	};
	
	valuelanguage = language;
		};

function change_mainpageLanguage () {
	var index = document.getElementById("Language").selectedIndex;
	var value = document.getElementById("Language").options[index].value;
	set_mainpageLanguage (userLanguage);
	return userLanguage;
};

function change_configLanguage () {
	var index = document.getElementById("Language").selectedIndex;
	if (index > 0) {
		var value = document.getElementById("Language").options[index].value;
		userLanguage = value;
		set_configLanguage (userLanguage);
	} else {
		set_configLanguage (userLanguage)
	};
	return userLanguage;
};

var mainpage_tables = {
	EN: {
		File: ["Open", "Open sound file"],
		Record: ["Record", "Record your speech. You have 4 seconds, watch the recording 'light'"],
		Play: ["Play", "Play back of your recorded pronunciation"],
		Quit: ["Quit", "Quit TEVA"],
		Config: ["Settings", "Go to 'Configuration' page"],
		Refresh: ["Refresh", "Redraw the current screen, the space-bar always refreshes screen"],
		Help: ["Help", "Press the button you want information on, 'Help' to continue"],
		Save: ["Print \# ", "Save a report in printer format"],
		File: ["Open", "Open sound file"],
		Draw_Sound: ["Sound", "Draw the Sound"],
		Draw_Pitch: ["Pitch", "Draw Pitch"],
		Draw_Harmonicity: ["Harmonicity", "Draw the Harmonicity to Noise ratio"],
		Draw_Spectrogram: ["Spectrogram", "Narrow band spectrogram (100 ms) with formants superimposed"],
		Draw_Ltas: ["Ltas", "Long time average spectrum"],
		Draw_Intensity: ["Intensity", "Draw Intensity"],
		Draw_Rating: ["Rating", "Rate the speech on scales "],
		Select: ["Select", "Select new start and endtime"],
		ToSelection: ["To selection", "Go to selected start and endtime"],
		ZoomOut: ["Zoom out -", "Double the current time window"],
		ZoomIn: ["Zoom in +", "Halve the current time window"],
		Previous: ["< Previous", "Previous interval, or shift current time window to the left"],
		Next: ["Next >", "Next interval, or shift the current time window to the right"]
		},
	JA: {
		File: ["開く", "音声データファイルを開く"],
		Record: ["録音", "録音できます. 4秒間録音可能です, 録音 'ライト'を見て下さい。"],
		Play: ["再生", "録音した音声を再生"],
		Quit: ["中断", "TEVAを中断する"],
		Config: ["設定", " %%Configuration% ページへ"],
		Refresh: ["リフレッシュ", "現在のスクリーンを再描画します,スペースバーは常に画面をリフレッシュします"],
		Help: ["ヘルプ", "知りたい情報があればヘルプボタンを押して下さい"],
		Save: ["印刷 #", "プリンタ形式でレポートを保存する"],
		File: ["開く", "音声データファイルを開く"],
		Draw_Sound: ["音声", "音声を描画する"],
		Draw_Pitch: ["ピッチ", "ピッチを描画する"],
		Draw_Harmonicity: ["調和音", "調和雑音比を描画する"],
		Draw_Spectrogram: ["スペクトログラム", "ナローバンドスペクトログラム（100ms）とフォルマントを合わせる"],
		Draw_Ltas: ["Ltas", "長時間平均スペクトル"],
		Draw_Intensity: ["強さ", "強度を描画する"],
		Draw_Rating: ["評価", "スピーチを評価する"],
		Select: ["選択", "新しい開始時間と終了時間を選ぶ"],
		ToSelection: ["選択", "選択した時間窓のみ表示する"],
		ZoomOut: ["ズームアウト -", "二画面表示"],
		ZoomIn: ["ズームイン +", "二分割画面"],
		Previous: ["< 前", "前のインターバルもしくは現在の画面を左へ移動する"],
		Next: ["次 >", "次のインターバルもしくは現在の画面を右へ移動する"]
		},
	DE: {
		File: ["Öffnen", "Laden einer Audio-Datei"],
		Record: ["Aufnahme", "Machen Sie eine Sprachaufnahme. Sie haben 4 Sekunden bevor die Aufnahme beginnt; achten Sie auf das rote Licht."],
		Play: ["Wiedergabe", "Abspielen der Aufnahme"],
		Quit: ["Ende", "Das Programm beenden"],
		Config: ["Einstellungen", "Zur Seite 'Einstellungen'"],
		Refresh: ["Aktualisieren", "Der aktuelle Bildschirm wird abgebildet. Mit der Leertaste kann der Bildschirm aktualisiert werden."],
		Help: ["Hilfe", "Drücken Sie auf den Knopf über den Sie Informationen möchten. Drücken Sie danach auf 'Hilfe'."],
		Save: ["Drucken", "Speichern der Daten zum abdrucken"],
		File: ["Öffnen", "Laden einer Audio-Datei"],
		Draw_Sound: ["Audio", "Abbildung des Audiosignals"],
		Draw_Pitch: ["Tonhöhe", "Abbildung der Tonhöhe"],
		Draw_Harmonicity: ["Harmonizität", "Abbildung des Harmonicity-to-Noise Verhältnis"],
		Draw_Spectrogram: ["Spektrogramm", "Abbildung des Schmalband-Spektrogramms (100 ms) mit Formante"],
		Draw_Ltas: ["Ltas", "Abbildung des gemittelten Langzeitspektrums"],
		Draw_Intensity: ["Intensität", "Abbildung der Intensität"],
		Draw_Rating: ["Wertung", "Bewerten Sie die Sprache "],
		Select: ["Selektieren", "Selektieren von Start- und Endzeiten"],
		ToSelection: ["Zur Selektion", "Gehe zum selektierten Abschnitt"],
		ZoomOut: ["Zoom out", "Verdoppelung der Fenstergrösse / Verkleinern"],
		ZoomIn: ["Zoom in", "Halbierung der Fenstergrösse / Vergrössern"],
		Previous: ["Zurück", "zum vorigen Abschnitt"],
		Next: ["Voraus", "zum nächsten Abschnitt"]
		},
	NL: {
		File: ["Open", "Open geluids bestand"],
		Record: ["Opnemen", "Neem spraak op. U hebt 4 seconden, let op het rode 'lampje'"],
		Play: ["Afspelen", "Speel je opgenomen uitspraak af"],
		Quit: ["Stop", "Stop NKI TE-VOICE ANALYSIS tool"],
		Config: ["Instellingen", "Ga naar de pagina met instellingen"],
		Refresh: ["Ververs", "Ververs de huidige pagina, de spatiebalk ververst altijd de pagina"],
		Help: ["Help", "Druk op de knop waar u informatie over wilt hebben, 'Help' als u verder wilt"],
		Save: ["Print \# ", "Bewaar rapport in een formaat voor printen"],
		File: ["Open", "Open geluids bestand"],
		Draw_Sound: ["Geluid", "Teken de geluidsfile"],
		Draw_Pitch: ["Toon", "Teken de toonhoogte"],
		Draw_Harmonicity: ["Harmoniciteit", "Teken de Harmonicity to Noise ratio"],
		Draw_Spectrogram: ["Spectrogram", "Smalband spectrogram (100 ms) met formanten"],
		Draw_Ltas: ["Ltas", "Long time average spectrum"],
		Draw_Intensity: ["Intensiteit", "Teken de intensiteit"],
		Draw_Rating: ["Beoordeel", "Geef schaaloordelen van de spraak "],
		Select: ["Selecteer", "Selecteer nieuwe start en eindtijd"],
		ToSelection: ["Naar selectie", "Ga naar geselecteerde start and eindtijd"],
		ZoomOut: ["Zoom uit -", "Verdubbel het huidige tijdsvenster"],
		ZoomIn: ["Zoom in +", "Halveer het huidige tijdsvenster"],
		Previous: ["< Vorige", "Vorige interval"],
		Next: ["Volgende >", "Volgende interval"]
	}
};

var config_tables = {
	EN: {
		RecordingTimePost: ["(sec)", "Time of recording in seconds"],
		Credits: ["About", "Information about NKI TE-VOICE ANALYSIS tool"],
		AudioCollection: ["Archive", "Recording and collection of audio"],
		SaveAudio: ["Audio", "Save current audio selection to file"],
		},
			
	JA: {
		RecordingTimePost: ["（秒）", "録音時間の秒数"],
		Credits: ["TEVAについて", "オランダがんセンター音声分析ツールについて"],
		AudioCollection: ["アーカイブ", "オーディオの録音とコレクション"],
		SaveAudio: ["オーディオ", "現在選択されているオーディオをファイルに保存"],
		},
		
	DE: {
		RecordingTimePost: ["(sec)", "Aufnahmezeit in Secunden"],
		Credits: ["über", "Informationen zur NKI TE-VOICE ANALYSIS tool"],
		AudioCollection: ["Aufbewahren", "Aufnahme un aufbewahren von audio"],
		SaveAudio: ["Audio", "Audiovenster in einer Datei schreiben"],
		},		
	NL: {
		RecordingTimePost: ["(sec)", "Opnametijd in seconden"],
		Credits: ["Over", "Informatie over NKI TE-VOICE ANALYSIS tool"],
		AudioCollection: ["Bewaren", "Opnemen en bewaren van audio"],
		SaveAudio: ["Audio", "Bewaar huidige selectie van geluid naar bestand"],
		}
};


var selector_tables = {
	EN: {
		Language: ["Language", "Select a language"],
		RecordingTime: ["Recording", "Time of recording in seconds"],
		Frequency: ["Frequency", "Highest frequency shown"],
		Frequency_10k: ["10kHz", "Display up to 10 kHz"],
		Frequency_8k: ["8kHz", "Display up to 8 kHz"],
		Frequency_5k: ["5kHz", "Display up to 5 kHz"],
		Frequency_3k: ["3kHz", "Display up to 3 kHz"],
		Frequency_2k: ["2kHz", "Display up to 2 kHz"],
		Frequency_1k: ["1kHz", "Display up to 1 kHz"],
		},
	JA: {
		Language: ["言語", "表示言語を設定します。"],
		RecordingTime: ["録音", "録音時間の秒数"],
		Frequency: ["周波数", "最大周波数を表示する"],
		Frequency_10k: ["10kHz", "10 kHzまでを表示する"],
		Frequency_8k: ["8kHz", "8 kHzまでを表示する"],
		Frequency_5k: ["5kHz", "5 kHzまでを表示する"],
		Frequency_3k: ["3kHz", "3 kHzまでを表示する"],
		Frequency_2k: ["2kHz", "2 kHzまでを表示する"],
		Frequency_1k: ["1kHz", "1 kHzまでを表示する"],
		},
	DE: {
		Language: ["Sprache", "Wähle die gewünschte Sprache"],
		RecordingTime: ["Aufnahme", "Aufnahmezeit in Secunden"],
		Frequency: ["Frequenz", "Höchstfrequenz im Spektrogramm"],
		Frequency_10k: ["10kHz", "Wiedergabe bis 10 kHz"],
		Frequency_8k: ["8kHz", "Wiedergabe bis 8 kHz"],
		Frequency_5k: ["5kHz", "Wiedergabe bis 5 kHz"],
		Frequency_3k: ["3kHz", "Wiedergabe bis 3 kHz"],
		Frequency_2k: ["2kHz", "Wiedergabe bis 2 kHz"],
		Frequency_1k: ["1kHz", "Wiedergabe bis 1 kHz"],
		},
	NL: {
		Language: ["Taal", "Selecteer de gewenste taal"],
		RecordingTime: ["Opname", "Opnametijd in seconden"],
		Frequency: ["Frequentie", "Hoogste frequentie"],
		Frequency_10k: ["10kHz", "Ga tot 10 kHz"],
		Frequency_8k: ["8kHz", "Ga tot 8 kHz"],
		Frequency_5k: ["5kHz", "Ga tot 5 kHz"],
		Frequency_3k: ["3kHz", "Ga tot 3 kHz"],
		Frequency_2k: ["2kHz", "Ga tot 2 kHz"],
		Frequency_1k: ["1kHz", "Ga tot 1 kHz"],
		},
}

var menu_tables = {
	EN: {
		AudioCollection: ["Archive", "Recording and collection of audio"],
		SaveAudio: ["Audio", "Save current audio selection to file"],
		Speaker: ["Speakers", "Table with speaker data"],
		SaveSpeaker: ["Save", "Write current table with speaker data"],
		},
			
	JA: {
		AudioCollection: ["アーカイブ", "オーディオの録音とコレクション"],
		SaveAudio: ["オーディオ", "現在選択されているオーディオをファイルに保存"],
		Speaker: ["話者", "話者データ一覧"],
		SaveSpeaker: ["保存", "現在の表に話者データを書き込む"],
		},
		
	DE: {
		AudioCollection: ["Aufbewahren", "Aufnahme un aufbewahren von audio"],
		SaveAudio: ["Audio", "Audiovenster in einer Datei schreiben"],
		Speaker: ["Sprecher", "Tabelle mit den Sprecherdaten"],
		SaveSpeaker: ["Speichern", "Speichere aktuelle Tabelle mit den Sprecherdaten"],
		},		
	NL: {
		AudioCollection: ["Bewaren", "Opnemen en bewaren van audio"],
		SaveAudio: ["Audio", "Bewaar huidige selectie van geluid naar bestand"],
		Speaker: ["Sprekers", "Tabel met spreker gegevens"],
		SaveSpeaker: ["Bewaar", "Bewaar huidige tabel met sprekergegevens"],
		}
};

var language_table = {
	Language_EN: ["English", "English language version"],
	Language_JA: ["日本語", "日本語版"],
	Language_DE: ["Deutsch", "Deutsche Version"],	
	Language_NL: ["Nederlands", "Gebruik Nederlands"]	
}

if(!mainpage_tables[userLanguage]) {
	userLanguage = undefined;
};
