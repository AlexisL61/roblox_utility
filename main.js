// DECLARATION VARIABLES

const { app, BrowserWindow, globalShortcut, ipcMain, session, shell } = require('electron')
var RPC = require("discord-rpc");
const client = new RPC.Client({ transport: 'ipc' });
const axios = require("axios")
const fs = require("fs")
const path = require("path")

var CurrentUser = {
	UserID: 0,
	UserName: "Guest",
	AvatarUrl: "https://www.roblox.com/bust-thumbnail/image?userId=1&width=420&height=420&format=png",
	PresenceImage:"",
	PresenceState:"",
	PresenceDetails:"",
}

var LoadedFile
var MainWindow
var CustomDetailsText

var DefaultSaveFile = {
	LastProfil: 0,
	Profil: []
}

var RandomColor = ["#ff0000", "#ffa500", "#e4ff00", "#00ff2b", "#00ffb8", "#00a1ff", "#1000ff", "#d800ff", "#ff006a", "#ffffff"]

// DECLARATION VARIABLES TEMPORAIRES



// DECLARATION FONCTIONS





function GetDataFile(){
    var filePath = path.join(app.getPath('userData'), "data" + '.json');
    if (fs.existsSync(filePath)){
		var resultData = fs.readFileSync(filePath);
		console.log("File loaded!")
        return resultData;
    }else{
        return
    }
}

function SaveDataFile(Data){
    var filePath = path.join(app.getPath('userData'), "data" + '.json');
    var resultData = fs.writeFile(filePath,Data, function(){
		console.log("File saved!")
	});
    return "Success";
}

function AddProfil(ProfilID, Username, BackgroundColor, AvatarUrl){
	var o = `
    <div style="background-image: linear-gradient(to bottom, rgba(0,0,0,0), #000000ad 60%);height: 100%;width: 100%;display: table;position: static;display: flow-root;">
        <a style="width: 100%;height: 100%;cursor: pointer;z-index: 555;display: block;position: absolute; border-radius: 10px;transition: 0.3s;" onclick="oo`+ProfilID+`()"></a>
      	<p style="font-size: 300%;color:white;text-align: center;width: 100%;height: 20px;font-size: 20px;">`+Username+`</p>
        <img src="`+AvatarUrl+`" style="width: 100%;height: auto;/* display: block; *//* margin-right: auto; *//* margin-left: auto; */position: absolute;display: block;top: 25%;border-radius: 15px;">
		
	</div>
	`

	MainWindow.webContents.executeJavaScript(`
	var d = document.createElement("div")

	d.style = "background-color: `+BackgroundColor+`;height: 200px;width: 150px;opacity: 1;background-size: auto 100%;background-position-x: center;/*background-image: url(Icons/JailbreakBackground.JPG)*/;display:inline-block;position: relative;border-radius: 15px;margin: 10px;border: black;border-style: solid;border-width: 5px;"
	d.id = "`+ProfilID+`"
	d.innerHTML = \``+o+`\`

	document.getElementById("ProfileTable").insertAdjacentElement('afterbegin', d)
	`)

	MainWindow.webContents.executeJavaScript(`
			function oo`+ProfilID+`(){
				const { ipcRenderer } = require('electron');
				ipcRenderer.send('info', {Type: 'ChangeProfil', id: "`+ProfilID+`"})

				document.getElementById("PlayerName").innerHTML = "`+Username+`"
			}
	`)
		}

function AddLog(win, LogText, LogId){ // TODO EASING
	win.webContents.executeJavaScript(
	`
	var o = document.getElementById("LoadTextSection").childNodes
	var u
	for(var i = 0; i < o.length; i++){
		if (o[i].id && o[i].id.substring(0,5) == "Block"){
			var g = Number(o[i].style.top.substring(0, o[i].style.top.length-2))
			o[i].style.top = (g + 30) + "px"
			for(var h = 0; h < o[i].childNodes.length; h++){
				if(o[i].childNodes[h].style.opacity == 0){
					o[i].style.display = "none"
				}
				o[i].childNodes[h].style.opacity = o[i].childNodes[h].style.opacity - 0.25
				console.log(o[i].childNodes[h].style.opacity)
			}
		}
	}

	var hh = document.createElement("h2")
	var b = document.createElement("b")
	var i1 = document.createElement("img")
	var i2 = document.createElement("img")

	hh.style = "display: block;text-align: center;font-family: 'Roboto', sans-serif;position: relative;opacity: 0;top: 0px;transition: 0.5s;"
	hh.id = "Block`+LogId+`"

	b.innerHTML = "`+LogText+`"
	b.style = "opacity: 0;text-align: left;align-items: center;align-self: center;position: absolute;right: 0%; width: 100%;transition: 0.5s;"
	
	i1.className = "RotateInfinite"
	i1.src = "./Icons/Chargement.PNG"
	i1.id = "Load`+LogId+`"
	i1.style = "height: 30px;width: auto;vertical-align: middle;transform: rotate(0deg);align-self: center;opacity: 0;right: 0%;position: absolute;transition: 0.5s;"

	i2.src = "./Icons/Success.PNG"
	i2.id = "Statue`+LogId+`"
	i2.style = "height: 30px;width: auto;vertical-align: middle;transform: rotate(0deg);align-self: center;opacity: 0;right: 0%;position: absolute; display: none;transition: 0.5s;"

	hh.appendChild(b)
	hh.appendChild(i1)
	hh.appendChild(i2)

	document.getElementById("LoadTextSection").insertAdjacentElement('afterbegin', hh)
	
	setTimeout(function(){
		hh.style.opacity = 1;
		b.style.opacity = 1;
		i1.style.opacity = 1;
		i2.style.opacity = 1;
	}, 100)
	
	`
	)
};

function SuccessLog(win, LogId){
	win.webContents.executeJavaScript(`
	var o = document.getElementById("LoadTextSection").childNodes
	var u
	for(var i = 0; i < o.length; i++){
		if (o[i].id == "Block`+LogId+`"){
			u = o[i]
		}
	}

	u.childNodes[1].style.display = "none";
	u.childNodes[2].style.display = "inline";
	`)
}

function FailLog(win, LogId){
	win.webContents.executeJavaScript(`
	var o = document.getElementById("LoadTextSection").childNodes
	var u
	for(var i = 0; i < o.length; i++){
		if (o[i].id == "Block`+LogId+`"){
			u = o[i];
		}
	}

	u.childNodes[1].style.display = "none";
	u.childNodes[2].src = "./Icons/Error.PNG" ;
	u.childNodes[2].style.display = "inline";
	`)
}

function Wait(TimeInSecond){
	return new Promise(done => setTimeout(done, TimeInSecond*1000));
}

// TRAITEMENT

app.on('ready', Object => {
	let win = new BrowserWindow({ width: 800, height: 600, webPreferences: {nodeIntegration: true, allowRunningInsecureContent: false, experimentalFeatures: false }})
	MainWindow = win

	win.on("ready-to-show", function(){
		console.log("Ready to show")
	})

	globalShortcut.register("CommandOrControl+Shift+I", function(){
		win.webContents.openDevTools({detach:true});
	});

	
	console.log("Load file...")
	win.loadFile('LoadingMenu.html')
	win.webContents.once('dom-ready', async function() {
		AddLog(win, "Connecting to Roblox Utility servers", "c1")
		axios.get('https://roblox-utility.glitch.me/?Method=CheckAvailability')
		.then(async function (res) {
			if (res.data["Result"] == "Available"){
				SuccessLog(win, "c1")
				AddLog(win, "Connecting to discord", "c2")
				client.on('ready', async function(){
					await Wait(1)
					SuccessLog(win, "c2")
					AddLog(win, "Loading user datas", "c3")
					LoadedFile = GetDataFile()
					if(!LoadedFile){
						LoadedFile = DefaultSaveFile;
						SaveDataFile(LoadedFile)
					}
					SuccessLog(win, "c3")
					await Wait(1)
					win.loadFile('ChooseProfilMenu.html')
				});
				client.login({clientId: '397453422636302347'});
			}else{
				console.log("Servers Unavailable")
				FailLog(win, "c1")
				await Wait(1)
				win.loadFile('LoadingFailed.html')
			}
		})
	});
	function changePresence(){
		if (CurrentUser["UserID"]!=0){
	axios.get('https://roblox-utility.glitch.me/?Method=Connect&ID='+CurrentUser["UserID"])
	.then(async function(Result){
		Result = Result.data
		if (Result[0]["success"]==true){
				var largeImage

				var ShowPresence = true
				var Details 
				if (Result[0]["userPresenceType"] == 1){

					Details = "On website"
					largeImage = "connect"
					CurrentUser["PresenceImage"] = "Icons/ConnectRoblox.png"
				}else if (Result[0]["userPresenceType"] == 2){
					Details = "Playing " + Result[0]["lastLocation"]
					if (Result[0]["ImageExist"]==true){
						largeImage = Result[0]["ImageID"]
					}else{
						largeImage = "ingame"
					}
					CurrentUser["PresenceImage"] = "Icons/InGameRoblox.png"
				}else if (Result[0]["userPresenceType"] == 3){
					Details = "Creating "+Result[0]["lastLocation"]
					if (Result[0]["ImageExist"]==true){
						largeImage = Result[0]["ImageID"]
					}else{
						largeImage = "instudio"	
					}
					CurrentUser["PresenceImage"] = "Icons/InStudioRoblox.png"
				}else if (Result[0]["userPresenceType"] == 0){
					ShowPresence = false
					Details = "Disconnected"

					CurrentUser["PresenceImage"] = "Icons/DisconnectRoblox.png"
				}
				CurrentUser["PresenceDetails"]=Details
				console.log(Result)
				if(ShowPresence){
					if (CurrentUser["PresenceState"]!=""){
					client.setActivity({
						details:Details,
							state: CurrentUser["PresenceState"],
							largeImageKey: largeImage,
							instance: false,
						});
					}else{
						client.setActivity({
								details: Details,
								largeImageKey: largeImage,
								instance: false,
							});
					}
				}else{
					client.clearActivity()
				}
		}
	})
	}
	}
	setInterval(changePresence, 15000);
})

app.on('browser-window-created',function(e,window) {
	window.setMenu(null);
 });

ipcMain.on('info', function(event, arg,secondArg){
	console.log(arg) // affiche "ping"
	if (arg.Type == "getcurrentuser"){
		event.returnValue = CurrentUser
		if(CurrentUser.Addition){
			CurrentUser["PresenceState"] = secondArg
		}
		
	}else if(arg.Type == "ChangeProfil"){
		for(var i = 0; i < LoadedFile.Profil.length; i++){
			if (LoadedFile.Profil[i].UserID == arg.id){
				CurrentUser["UserID"] = LoadedFile.Profil[i].UserID
				CurrentUser["AvatarUrl"] = LoadedFile.Profil[i].AvatarUrl
				CurrentUser["UserName"] = LoadedFile.Profil[i].UserName
				MainWindow.loadFile("RichPresence.html")
				return;
			}

		}
	}else if(arg.Type == "getProfils"){
		if (LoadedFile.Profil && LoadedFile.Profil.length > 0){
			for(var i = 0; i < LoadedFile.Profil.length; i++){
				AddProfil(LoadedFile.Profil[i].UserID, LoadedFile.Profil[i].UserName, LoadedFile.Profil[i].ProfilColor, LoadedFile.Profil[i].AvatarUrl)
			}
		}
	}else if(arg.Type == "MakeNewProfile"){
		axios.get('http://api.roblox.com/users/get-by-username?username='+arg.name)
		.then(async function (res) {
			if (res.data["Id"]){
				event.sender.send("ProfileCreated")
				if (!LoadedFile.Profil){LoadedFile.Profil = []}
				
				LoadedFile.Profil.push({
					UserID: res.data["Id"],
					UserName: res.data["Username"],
					AvatarUrl: "https://www.roblox.com/bust-thumbnail/image?userId="+res.data["Id"]+"&width=420&height=420&format=png",
					ProfilColor: RandomColor[Math.floor(Math.random()*RandomColor.length)]
				});

				LoadedFile.LastProfil = res.data["Id"];

				CurrentUser["UserID"]= res.data["Id"],
				CurrentUser["UserName"]= res.data["Username"],
				CurrentUser["AvatarUrl"] ="https://www.roblox.com/bust-thumbnail/image?userId="+res.data["Id"]+"&width=420&height=420&format=png",
				

				SaveDataFile(LoadedFile)

				event.sender.send("ProfileCreated")

				MainWindow.loadFile('RichPresence.html')
			}else{
				event.sender.send("NewProfileError")
			}
		});
		
	}
})

app.on('web-contents-created', (event, contents) => {
	contents.on('new-window', (event, navigationUrl) => {
	  // In this example, we'll ask the operating system
	  // to open this event's url in the default browser.
	  event.preventDefault()
  
	  shell.openExternalSync(navigationUrl)
	})
  })