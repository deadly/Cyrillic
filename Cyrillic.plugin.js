/**
 * @name Cyrillic
 * @author Seraph
 * @authorId 686440496561913856
 * @website https://sendthigh.pics
 * @description Used for replacing suitable characters in a message with Cyrillic characters to bypass blacklisted word filters or to evade keyword detection
 * @version 1.0
 */

module.exports =(() => {
    const config =
	{
		info:
		{
			name: "Cyrillic",
			authors:
			[
				{
					name: "Seraph",
					discord_id: "686440496561913856",
					github_username: "deadly",
				}
			],
			version: "1.0.0",
			description: "Used for replacing suitable characters in a message with Cyrillic characters to bypass blacklisted word filters or to evade keyword detection"
        }
    };  

    return !global.ZeresPluginLibrary ? class {
        getName = () => config.info.name
        getAuthor = () => config.into.description
        getVersion = () => config.info.version

        load () {
            BdApi.showConfirmationModal("Required Library Not Found", "The library needed for Cyrillic could not be found. Click Download Now to install it.", {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
						if (err) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
                }
            });
        }

        start() {}
        stop() {}

    } : (([Plugin, Api]) => {

        const plugin = (Plugin, Api) => {
            const { DiscordModules, ReactComponents, Patcher} = Api;
            const { React } = DiscordModules;
            let lastRender = new Date();
            let lastTextAreaEvent;
            let lastLength;

            return class Cyrillic extends Plugin {
                async onStart() {
                    Patcher.instead(DiscordModules.MessageActions, "sendMessage", (_, args, sendMessage) => {
                        this.getCyrillic(args[1].content + " ", true).then(cyrillic => {
                            args[1].content = cyrillic;
                            sendMessage(...args)
                            lastLength = -1;
                            process.nextTick(() => this.setText(null, ""))
                        });
                    });
                    
    
                    Patcher.after(TextArea.component.prototype, "render", e => {
                        const current = new Date();
    
                        if (current - lastRender > 10) {
                            this.getCyrillic(e.props.textValue, false).then(cyrillic => {
                                if (e.props.textvalue != cyrillic) {
                                    this.setText(e, cyrillic);
                                }
                            });
                        }

                        lastRender = current;
                    });
                }
    
                async getCyrillic(textValue, sending) {
                    const cyrDict = {
                        "A": "А",
                        "a": "а",
                        "B": "В",
                        "E": "Е",
                        "e": "е",
                        "K": "К",
                        "M": "М",
                        "H": "Н",
                        "O": "О",
                        "o": "о",
                        "P": "Р",
                        "p": "р",
                        "C": "С",
                        "c": "с",
                        "T": "Т",
                        "y": "y",
                        "X": "Х",
                        "x": "х",
                        "u": "υ"
                    };
                    if (textValue.includes('http')) {
                        return textValue
                    }
                    [...textValue].forEach(l => {
                        try {
                            (cyrDict[l] == undefined) ? "" : textValue = textValue.replace(l, cyrDict[l]);
                        }
                        catch{

                        }
                    })
                    
                    return textValue
                }
    
                setText(_e, text) {
                    const e = _e == null ? lastTextAreaEvent : _e;
                    if(e && e.ref.current) {
                        e.ref.current.setValue(SlateModule.deserialize(text));
                        e.focus();
                        e.ref.current.editorRef.moveFocusToEndOfText();
                        e.ref.current.editorRef.moveToFocus();
                        lastTextAreaEvent = e;
                    }
                }
    
                onStop() {
                    Patcher.unpatchAll();
                }
            };
        }

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();