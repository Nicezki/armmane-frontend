class ARMMane{
    constructor(address = "localhost", port = "8000", protocol = "http", serverList = []) {
        if (serverList.length == 0) {
            serverList = [
                    {
                        "name": "Nicezki Pi (For Dev)",
                        "address": "pi.nicezki.com",
                        "port": "",
                        "protocol": "https"
                    },
                    {
                        "name": "Nicezki HTTPS (Deprecated)",
                        "address": "miri.network.nicezki.com",
                        "port": "5000",
                        "protocol": "https"
                    },
                    {
                        "name": "Local Server",
                        "address": "localhost",
                        "port": "8000",
                        "protocol": "http"
                    },
                ];
        }


        this.appStatus = {
            "connected" : false,
            "isDisconnecting" : false,
            "serverList" : serverList,
            "server" : {
                "fullURL" : protocol + "://" + address + (port ? ":" + port : ""),
                "address" : address,
                "port" : port,
                "protocol" : protocol,
            },
            "currentScreen" : "screen_connect",
        }


        this.elements = {
            "mode" : ["btn", "form", "ui", "screen", "template"],
            "screen" : {
                "errorloading" : document.querySelector(".scr-errload"),
                "loading" : document.querySelector(".scr-loading"),
                "connect" : document.querySelector(".scr-connect"),
                "main" : document.querySelector(".scr-main"),
            },
            "ui" : {
                "statusarea" : document.querySelector(".main-statusarea"),
                "controlarea" : document.querySelector(".main-controlarea"),
                "settingarea" : document.querySelector(".main-settingarea"),
                "log_area" : document.querySelector(".log-area"),
                "log_disconnect" : document.querySelector(".log-disconnect"),
            },
            "btn" : {
                "status_toggle" : document.querySelector(".btn-status-toggle"),
                "main_info" : document.querySelector(".btn-main-info"),
                "main_control" : document.querySelector(".btn-main-control"),
                "main_config" : document.querySelector(".btn-config"),
            },
            "form" : {
                "servo_00" : document.querySelector("#form-field-s0"),
                "servo_01" : document.querySelector("#form-field-s1"),
                "servo_02" : document.querySelector("#form-field-s2"),
                "servo_03" : document.querySelector("#form-field-s3"),
                "servo_04" : document.querySelector("#form-field-s4"),
                "servo_05" : document.querySelector("#form-field-s5"),
                "conv_00" : document.querySelector("#form-field-conv1"),
                "conv_01" : document.querySelector("#form-field-conv2"),
            },
            "template" : {
                "btn_serverlist" : document.querySelector(".tp-btn-server"),
            },
        }
        
        // this.uiElements = {
        //     "arm-status" : document.querySelector(".arm-status > div > h2"),
        //     "amn-icon" : document.querySelector(".amn-icon"),
        //     "amn-config-box" : document.querySelector(".amn-config-box"),
        //     "amn-info-box" : document.querySelector(".amn-info-box"),
        //     "btn-info" : document.querySelector(".btn-info"),
        //     "btn-control" : document.querySelector(".btn-control"),
        //     "btn-config" : document.querySelector(".btn-config"),
        //     "btn-config-inner" : document.querySelector(".btn-config > div > div > a"),
        //     "btn-preset-temp" : document.querySelector(".btn-preset-temp"),
        //     "btn-s-control" : document.querySelector(".btn-s-control"),
        //     "chip-servo-0" : document.querySelector(".chip-servo-0 div > h4"),
        //     "chip-servo-1" : document.querySelector(".chip-servo-1 div > h4"),
        //     "chip-servo-2" : document.querySelector(".chip-servo-2 div > h4"),
        //     "chip-servo-3" : document.querySelector(".chip-servo-3 div > h4"),
        //     "chip-servo-4" : document.querySelector(".chip-servo-4 div > h4"),
        //     "chip-servo-5" : document.querySelector(".chip-servo-5 div > h4"),
        //     "conf-cur-selmodel" : document.querySelector(".conf-cur-selmodel > div > h6"),
        //     "conf-cur-conv1" : document.querySelector(".conf-cur-conv1 > div > h6"),
        //     "conf-cur-conv2" : document.querySelector(".conf-cur-conv2 > div > h6"),
        //     "form-field-s0" : document.querySelector("#form-field-s0"),
        //     "form-field-s1" : document.querySelector("#form-field-s1"),
        //     "form-field-s2" : document.querySelector("#form-field-s2"),
        //     "form-field-s3" : document.querySelector("#form-field-s3"),
        //     "form-field-s4" : document.querySelector("#form-field-s4"),
        //     "form-field-s5" : document.querySelector("#form-field-s5"),
        //     "form-field-conv1" : document.querySelector("#form-field-conv1"),
        //     "form-field-conv2" : document.querySelector("#form-field-conv2"),
        //     "form-field-selmodel" : document.querySelector("#form-field-selmodel"),
        //     "list" : document.querySelectorAll(".list"),
        //     "swim-lane" : document.querySelectorAll(".swim-lane"),
            
        // };
        // this.config = [];
        // this.controlMode = 0;
        // this.convMode = ["หยุด", "เดินหน้า", "ถอยหลัง"];

        this.init();
    }




    
    /**
     * The init function sets up the initial state of the app.
     
     *
     *
     * @return Nothing
     *
     */
    init() {
        this.consoleLog("「ARMMANE」 by Nattawut Manjai-araya  v1.5.0");
        // Hide all screen
        this.hideAllScreen();

        // Hide element log_disconnect
        this.hideElement("log_disconnect");

        // Show loading screen
        this.showScreen("connect");

        this.setupElementTrigger();
        // this.clearDropdownItem("form-field-selmodel");
        this.setupSSE();
    }



    
    /**
     * The setTriggerEvent function is used to assign an event listener to a specific element.
     * 
     *
     * @param mode Determine which element is being used
     * @param element_name Identify the element that will be assigned to the event
     * @param event Determine which event to listen for
     * @param func Define the function that will be executed when the event is triggered
     *
     * @return Nothing
     *
     */
    setTriggerEvent(mode, element_name, event, func) {
        if (!this.elements["mode"].includes(mode)) {
            this.consoleLog("「ARMMANE」 Mode " + mode + " not found", "ERROR");
            return;
        }
        this.elements[mode][element_name].addEventListener(event, func);
        this.consoleLog("「ARMMANE」 Element " + element_name + " assigned to " + event + " event");
    }



    
    /**
     * The setupElementTrigger function sets up the event listeners for each element.
     * 
     */
    setupElementTrigger() {
        // status_toggle
        this.setTriggerEvent("btn", "status_toggle", "click", () => {
            this.toggleStatusInfo();
        });

    }

    
    /**
     * The toggleStatusInfo function toggles the display of the log area.
     *
     */
    toggleStatusInfo() {
        if (this.elements["ui"]["log_area"].style.display == "none") {
            this.elements["ui"]["log_area"].style.display = "flex";
        }else{
            this.elements["ui"]["log_area"].style.display = "none";
        }
    }



    /**
     * The showScreen function shows the screen that was
     * specified.
     * 
     * 
     *
     * @param screen_name Identify which screen to show
     *
     * @return Nothing
     *
     */
    showScreen(screen_name) {
        this.elements["screen"][screen_name].style.display = "flex";
        this.elements["currentScreen"] = screen_name;
    }


    
    /**
     * The hideScreen function hides the screen that was specified.
     * 
     *
     * @param screen_name Identify which screen to hide
     *
     * @return Nothing
     *
     */
    hideScreen(screen_name) {
        this.elements["screen"][screen_name].style.display = "none";
    }



    
    /**
     * The hideAllScreen function hides all the screens from the UI.
     *
     *
     * @return Nothing
     *
     */
    hideAllScreen() {
        for (var key in this.elements["screen"]) {
            this.hideScreen(key);
        }
    }



    
    /**
     * The createServerSelectionButton function creates a button for each server in the server list.
     * The buttons are added to the UI element with id &quot;conn-serverlist-box&quot;.
     *
     *
     *
     */
    createServerSelectionButton() {
        for (var i = 0; i < this.server_list.length; i++) {
            let newdiv = this.elements["template"]["btn_serverlist"].cloneNode(true);
            // Add classnames to button
            newdiv.classList.add("btn-server");
            newdiv.classList.add("btn-serverlist-" + i);
            // remove template class
            newdiv.classList.remove("tp-btn-server");
            // Change button text
            newdiv.querySelector(".elementor-button-text").textContent = this.appStatus["serverList"][i]["name"];
            newdiv.style.display = "flex";
            // Add property to button for access server list
            newdiv.address = this.appStatus["serverList"][i]["address"];
            newdiv.port = this.server_list[i]["port"];
            newdiv.protocol = this.server_list[i]["protocol"];
            // Add event listener to button
            newdiv.addEventListener("click", () => {
                // Called function to change server
                this.changeServer(newdiv.address, newdiv.port, newdiv.protocol);
            });
            this.uiElements["conn-serverlist-box"].appendChild(newdiv);
        }
    }



    createPresetButton(){
        this.getConfig();
        let config = this.config;
        array.forEach(element => {

        });
    }


    addDropdownItem(element_name, item_name, item_value) {
        let item = document.createElement("option");
        item.value = item_value;
        item.textContent = item_name;
        this.uiElements[element_name].appendChild(item);
    }



    clearDropdownItem(element_name) {
        this.uiElements[element_name].options.length = 0;
    }

    addModelItem() {
        this.getDataFromAPI("model").then(data => {
            for(let i = 0; i < data.length; i++) {
                this.addDropdownItem("form-field-selmodel", data[i], data[i]);
            }
        });
    }

    getConfig() {
        if (this.config.length == 0 || this.config == null || isempty(this.config)) {
            this.updateConfig();
            return this.config;
        }
        else {
            return this.config;
        }
    }

    async updateConfig() {
        (this.getDataFromAPI("config")).then(data => {
            console.log(data);
            this.config = data;
            return this.config;
        });
        }

    controlServo(servo, value) {
        // send POST api to server
        fetch(this.serverURL + "/command/servo/" + servo + "/" + value, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then(data => {
            this.consoleLog("「ARMMANE」 Servo "+servo+" value changed to "+value);
        })
        .catch(err => {
            console.log(err);
        });
    }

    controlConv(conv, value) {
        // send POST api to server
        fetch(this.serverURL + "/command/conv/" + conv + "/" + value, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then(data => {
            this.consoleLog("「ARMMANE」 Conv "+conv+" value changed to "+value);
        })
        .catch(err => {
            console.log(err);
        });
    }

    getArmStatus() {
        // send GET api to server
        fetch(this.serverURL + "/status/arm", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then(data => {
            this.uiElements["form-field-s0"].value = data["status_arm"]["servo"][0];
            this.uiElements["form-field-s1"].value = data["status_arm"]["servo"][1];
            this.uiElements["form-field-s2"].value = data["status_arm"]["servo"][2];
            this.uiElements["form-field-s3"].value = data["status_arm"]["servo"][3];
            this.uiElements["form-field-s4"].value = data["status_arm"]["servo"][4];
            this.uiElements["form-field-s5"].value = data["status_arm"]["servo"][5];
        })
        .catch(err => {
            console.log(err);
        });
    }
        

    async setupSSE(){
        const source = new EventSource(this.serverURL + "/sse/status");
        if (this.connected || this.source != null) {
            // Disconnect first
            this.disconnect();
            this.connected = false;
        }
        this.source = source;
        this.source.onopen = () => {
            this.consoleLog("[INFO] SSE connected to " + this.serverAddress + ":" + this.serverPort,"WARN");
        }
        this.source.onerror = () => {
            this.consoleLog("[INFO] SSE disconnected from " + this.serverAddress + ":" + this.serverPort,"WARN");
        }
        this.source.onmessage = (event) => {
            let data = JSON.parse(event.data);
        }
        this.connected = true;
        this.source.addEventListener("arm_status", (event) => {
            let data = JSON.parse(event.data);
            if (this.controlMode == 0) { 
            this.uiElements["form-field-s0"].value = data["servo"][0];
            this.uiElements["form-field-s1"].value = data["servo"][1];
            this.uiElements["form-field-s2"].value = data["servo"][2];
            this.uiElements["form-field-s3"].value = data["servo"][3];
            this.uiElements["form-field-s4"].value = data["servo"][4];
            this.uiElements["form-field-s5"].value = data["servo"][5];
            }
            this.changeText("conf-cur-conv1", this.convMode[data["conv"][0]]);
            this.changeText("conf-cur-conv2", this.convMode[data["conv"][1]]);
        });
        return true;
    }

    connect() {
        let ssesource = this.setupSSE();
        if (ssesource) {
            this.consoleLog("Connected to server at " + this.serverAddress + ":" + this.serverPort,"SUCCESS");
            this.connected = true;
        }else{
            this.consoleLog("Connection to server at " + this.serverAddress + ":" + this.serverPort + " failed", "ERROR");
            this.connected = false;
        }
    }

    disconnectSSE() {
        this.source.close();
        this.consoleLog("[INFO] SSE disconnected from " + this.serverAddress + ":" + this.serverPort,"WARN");
    }


    disconnect() {
        this.connected = false;
        this.consoleLog("[INFO] Disconnected from server at " + this.serverAddress + ":" + this.serverPort,"WARN");
    }

    async getDataFromAPI(path, value = "") {
        if(value != "") {
            this.consoleLog("「ARMMANE」 POST " + this.serverURL + "/" + path + "/" + value);
            return fetch(this.serverURL + "/" + path + "/" + value, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
                return data
            })
            .catch(err => {
                console.log(err);
            });
        }
        else {
            this.consoleLog("「ARMMANE」 GET " + this.serverURL + "/" + path);
            return fetch(this.serverURL + "/" + path, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
                return data
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    showElement(mode, element_name) {
        if (!this.elements["mode"].includes(mode)) {
            this.consoleLog("「ARMMANE」 Mode " + mode + " not found", "ERROR");
            return;
        }
        this.elements[mode][element_name].style.display = "flex";
    }

    hideElement(mode, element_name) {
        if (!this.elements["mode"].includes(mode)) {
            this.consoleLog("「ARMMANE」 Mode " + mode + " not found", "ERROR");
            return;
        }
        this.elements[mode][element_name].style.display = "none";
    }

    reshowElement(mode, element_name) {
        if (!this.elements["mode"].includes(mode)) {
            this.consoleLog("「ARMMANE」 Mode " + mode + " not found", "ERROR");
            return;
        }
        this.elements[mode][element_name].style.display = "none";
        setTimeout(() => {
            this.elements[mode][element_name].style.display = "flex";
        }, 100);
    }

    reshowElementByTime(mode, element_name, time) {
        if (!this.elements["mode"].includes(mode)) {
            this.consoleLog("「ARMMANE」 Mode " + mode + " not found", "ERROR");
            return;
        }
        this.elements[mode][element_name].style.display = "none";
        setTimeout(() => {
            this.elements[mode][element_name].style.display = "flex";
        }, time);
    }

    hideElementByTime(mode, element_name, time) {
        if (!this.elements["mode"].includes(mode)) {
            this.consoleLog("「ARMMANE」 Mode " + mode + " not found", "ERROR");
            return;
        }
        this.elements[mode][element_name].style.display = "flex";
        setTimeout(() => {
            this.elements[mode][element_name].style.display = "none";
        }, time);
    }


    changeText(element_name, text) {
        this.uiElements[element_name].textContent = text;
    }

    getText(element_name) {
        return this.uiElements[element_name].textContent;
    }

    changeIcon(element_name, icon) {
        let icon_name = "fas fa-" + icon;
        this.uiElements[element_name].className = icon_name;
    }

    getIcon(element_name) {
        return this.uiElements[element_name].className;
    }

    changeProgress(element_name, progress) {
        this.uiElements[element_name].style.width = progress + "%";
    }

    getProgress(element_name) {
        return this.uiElements[element_name].style.width;
    }




    toggleArmConfig() {
        if (this.uiElements["amn-config-box"].style.display == "none") {
            this.uiElements["amn-config-box"].style.display = "flex";
            this.uiElements["btn-config-inner"].style.color = "#FF006E";
            this.uiElements["btn-config-inner"].style.backgroundColor = "#FFFFFF";
        }
        else {
            this.uiElements["amn-config-box"].style.display = "none";
            this.uiElements["btn-config-inner"].style.color = "#FFFFFF";
            this.uiElements["btn-config-inner"].style.backgroundColor = "#FF006E";
        }
    }

    consoleLog(Text, Type = "", Color = "", Bold = false, Italic = false) {
        let logStyle = "";
    
        // 「ARMMANE」
        switch (Type.toUpperCase()) {
            case "INFO":
                logStyle = "background-color: #E60962; color: white;";
                break;
            case "SUCCESS":
                logStyle = "background-color: green; color: white;";
                break;
            case "WARN":
                logStyle = "background-color: orange; color: white;";
                break;
            case "ERROR":
                logStyle = "background-color: red; color: white;";
                break;
            default:
                break;
        }
    
        if (Color) {
            logStyle = `background-color: ${Color}; color: white;`;
        }
    
        // Apply Bold and Italic styles if specified
        if (Bold && Italic) {
            Text = `<b><i>${Text}</i></b>`;
        } else if (Bold) {
            Text = `<b>${Text}</b>`;
        } else if (Italic) {
            Text = `<i>${Text}</i>`;
        }
    
        const logMessage = `%c${Type ? " [" + Type + "] " : ""}${Text}`;
    
        console.log(logMessage+" ", logStyle);
    }

}


var app = new ARMMane();
