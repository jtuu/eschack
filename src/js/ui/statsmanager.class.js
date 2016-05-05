const StatsManager = class StatsManager {
	constructor(playerWrap, gameCont, playerStats, gameStats) {
		this.playerWrap = playerWrap;
		this.gameCont = gameCont;
		this.playerStats = playerStats;
		this.gameStats = gameStats;

		//map stats keys to displayed strings
		this.usedPlayerStats = {
			"STR": "STR",
			"INT": "INT",
			"DEX": "DEX",
			"viewDistance": "Vision",
			"moveSpeed": "Speed",
      "AC": "AC",
			"XL": "XL",
			"XP": "XP"
		};

		this.usedGameStats = {
			"dungeonName": "",
			"time": "Time",
			"currentDungeonLevel": "Depth",
      "score": "Score"
		};

		this.create();
	}

	create() {
		let playerStatCont = document.createElement("div");
		playerStatCont.style.padding = "10px";
		this.playerStatCont = playerStatCont;

		this.playerStatElements = {};

		Object.keys(this.usedPlayerStats).forEach(key => {
			let parent = document.createElement("div"),
				stat = document.createElement("div"),
				value = document.createElement("div");

			parent.className = "player-stat-row";
			stat.className = "player-stat-name";
			value.className = "player-stat-value";

			stat.innerHTML = this.usedPlayerStats[key];
			value.innerHTML = this.playerStats[key];
			parent.appendChild(stat);
			parent.appendChild(value);
			if(key === "XL" || key === "XP"){
				this.playerWrap.appendChild(parent);
			}else{
				this.playerStatCont.appendChild(parent);
			}

			this.playerStatElements[key] = {
				stat,
				value
			};
		});
		this.playerWrap.appendChild(this.playerStatCont);

		this.gameStatElements = {};

		Object.keys(this.usedGameStats).forEach(key => {
			let parent = document.createElement("div"),
				stat = document.createElement("div"),
				value = document.createElement("div");

			parent.className = "game-stat-row";
			stat.className = "game-stat-name";
			value.className = "game-stat-value";

			parent.id = "game-stat-" + key;

			stat.innerHTML = this.usedGameStats[key];
			value.innerHTML = this.gameStats[key];
			parent.appendChild(stat);
			parent.appendChild(value);
			this.gameCont.appendChild(parent);

			this.gameStatElements[key] = {
				stat,
				value
			};
		});
	}

	update() {
		Object.keys(this.usedPlayerStats).forEach(key => {
			this.playerStatElements[key].value.innerHTML = this.playerStats[key];
		});
		Object.keys(this.usedGameStats).forEach(key => {
			this.gameStatElements[key].value.innerHTML = this.gameStats[key];
		});
	}
};
