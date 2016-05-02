const StatsManager = class StatsManager {
  constructor(playerWrap, gameCont, playerStats, gameStats){
    this.playerWrap = playerWrap;
    this.gameCont = gameCont;
    this.playerStats = playerStats;
    this.gameStats = gameStats;

    this.usedPlayerStats = {
      "STR": "STR",
      "INT": "INT",
      "DEX": "DEX",
      "viewDistance": "vision",
      "moveSpeed": "speed"
    };

    this.create();
  }

  create(){
    let playerStatCont = document.createElement("div");
    playerStatCont.style.padding = "10px";
    this.playerStatCont = playerStatCont;
    this.playerWrap.appendChild(this.playerStatCont);

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
      this.playerStatCont.appendChild(parent);

      this.playerStatElements[key] = {stat, value};
    });
  }

  update(){
    Object.keys(this.usedPlayerStats).forEach(key => {
      this.playerStatElements[key].value.innerHTML = this.playerStats[key];
    });
  }
};
