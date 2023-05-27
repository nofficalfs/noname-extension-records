// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// This File is From Noname Unofficial Free Software
// Licensed under GNU GENERAL PUBLIC LICENSE Version 3
// File: extension.js (nofficalfs/noname-extension/records/extension.js)
// Content: 
// Copyright (c) 2023 nofficalfs All rights reserved
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

game.import("extension", (lib, game, ui, get, ai, _status) => {
	"use strict"
	let env = new Map();

	const main = (_env) => {
		let extension = {},
			meta = extension.package = {};
		info(extension, meta);

		env.set("extension", extension);
		env.set("config", extension.config);

		// delete extension.config;

		return extension;
	};

	const info = (extension, meta) => {
		extension.name = "Records";
		extension.author = "All of you";
		extension.version = {
			major: 0,
			modal: 0,
			minor: 1,
			revision: 0,
			build: 1,
		};

		extension.content = content(lib, game, ui, get, ai, _status);
		extension.precontent = precontent(lib, game, ui, get, ai, _status);

		extension.config = {
			"choose": {
				"name": null,
				"clear": true,
				"nopointer": true
			},
			"delete1": {
				"name": "清除",
				"clear": true,
				"onclick": () => {
					const cache = env.get("cache"),
						select = document.getElementById("extension_record_choose"),
						name = select.options[select.selectedIndex].value;

					if (!name) return alert("暂无数据");
					if (!(name in cache)) return alert("你已经清除了该数据");

					const all = cache[name].win + cache[name].lose,
						percentage = all != 0 ? cache[name].win / all : 0;

					if (confirm("是否清空" + get.translation(name) + "的记录（总场数: " + all + ", 胜率: " + Math.round(percentage * 10000) / 100 + "%)?")) {
						delete cache[name];
						saveCache(cache);
						modifyDisplay(cache, name);
						alert("清除成功");
					};
				}
			},
			"deleteAll": {
				"name": "全部清除", 
				"clear": true, 
				"onclick": () => {
					const cache = env.get("cache");

					if (confirm("是否清空所有武将的记录?")) {
						const names = Array.from(Object.keys(cache));
						for (const name of names) {
							delete cache[name];
							modifyDisplay(cache, name);
						}
						saveCache(cache);
						alert("清除成功");
					};
				}
			}
		};

		meta.author = "Noname";
		meta.version = "0.1.0";
		meta.intro = "记录战斗次数";
	};

	const content = (lib, game, ui, get, ai, _status) => (config, pack) => {
		const arenaReady = [() => {
			let cache = env.get("cache");
			let select = document.createElement("select");
			select.id = "extension_record_choose";
			select.size = 1;
			select.style.width = "180px";

			for (const name in lib.character) {
				modifyDisplay(cache, name);

				if (name in cache) {
					let option = document.createElement("option");
					option.value = name;
					option.innerHTML = get.translation(name);

					select.appendChild(option);
				}
			}

			lib.extensionMenu.extension_Records.choose.name = "请选择需要清空记录的武将<br/>" + select.outerHTML;
		}, () => {
			new Promise(resolve => {
				const interval = setInterval(() => {
					if (!ui.menuContainer || !ui.menuContainer.firstElementChild) return;
					clearInterval(interval);
					resolve();
				}, 50);
			}).then(_void => {
				const bar = ui.menuContainer.firstElementChild.querySelector(".menu-tab");
				const extDivList = menuBar.childNodes[4]._link.childNodes[0];
				const left = Array.from(extDivList.childNodes).find(
					div => div.innerHTML === "Records"
				);
				const right = left.link;
				return [left, right];
			}).then(exts => {
				let left = exts[0];
				right = exts[1];

				// May not code;
			});
		}];
		const onover = result => {
			let cache = env.get("cache");
			const player = game.me,
				names = [player.name1, player.name2].filter(item => item != undefined);

			names.forEach(name => {
				if (!(name in cache)) cache[name] = {
					win: 0,
					lose: 0
				};

				++cache[name][result ? "win" : "lose"];

				modifyDisplay(cache, name);
			});

			saveCache(cache);
		};

		env.get("promise").then(_void => {
			("arenaReady" in lib) ? lib.arenaReady.addArray(arenaReady) : arenaReady.forEach(fn => fn());
			lib.onover.add(onover);
		});
	};

	const precontent = (lib, game, ui, get, ai, _status) => (config) => {
		const promise = new Promise(resolve => {
			game.ensureDirectory("cache", resolve);
		}).then(_void => new Promise(resolve =>
			game.readFile("cache/records.bin", resolve, resolve)
		)).then(config => new Promise(resolve => {
			let result = {};

			if (Buffer.isBuffer(config) || config instanceof ArrayBuffer) {
				let decoder = new TextDecoder();
				let content = Buffer.from(decoder.decode(config), "base64");

				result = JSON.parse(content.map(code => code ^ 178).toString());
			}

			resolve(result);
		})).then(result => {
			env.set("cache", result);
		});

		env.set("promise", promise);
	};

	const saveCache = cache => {
		new Promise(resolve => {
			game.ensureDirectory("cache", resolve);
		}).then(_void => new Promise(resolve => {
			let json = JSON.stringify(cache);
			console.log(json);
			const str = Buffer.from(json).map(code => code ^ 178).toString("base64");
			game.writeFile(str.replace(/\=+$/, ""), "cache", "records.bin", resolve);
		}));
	};

	const modifyDisplay = (cache, name) => {
		if (!env.has(name))
			env.set(name, (name in lib.characterTitle) ? lib.characterTitle[name] : null);

		const bool = name in cache;
		let win = bool ? cache[name].win : 0,
			lose = bool ? cache[name].lose : 0;

		const all = win + lose,
			percentage = all != 0 ? win / all : 0;

		const str = "总场数: " + String(all) + "<br/>胜率: " + String(Math.round(percentage * 10000) / 100) + "%";
		if (env.get(name) == null) lib.characterTitle[name] = str;
		else lib.characterTitle[name] = env.get(name) + "<br/><br/>" + str;
	};

	return main(env);
});
