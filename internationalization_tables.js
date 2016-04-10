var userLanguage = (navigator.language) ? navigator.language : navigator.userLanguage;
userLanguage = userLanguage.substr(0,2).toUpperCase();

function set_mainpageLanguage (language) {
	var labels = internationalization_tables[language];
	for(x in labels) {
		if(document.getElementById(x)) {
			document.getElementById(x).textContent = labels[x][0];
			document.getElementById(x).parentNode.parentNode.title = labels[x][1];
		};
	};
};
var internationalization_tables = {
	EN: {
		File: ["Open", "Open sound file"],
		Record: ["Record", "Record your speech. You have 4 seconds, watch the recording 'light'"],
		Play: ["Play", "Play back of your recorded pronunciation"],
		Quit: ["Quit", "Quit TEVA"],
		Config: ["Settings", "Go to 'Configuration' page"],
		Refresh: ["Refresh", "Redraw the current screen, the space-bar always refreshes screen"],
		Help: ["Help", "Press the button you want information on, 'Help' to continue"],
		Save: ["Print \# ", "Save a report in printer format"],
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

if(!internationalization_tables[userLanguage]) {
	userLanguage = undefined;
};
