class ARMMane{
    constructor(address = "localhost", port = "8000", protocol = "http", serverList = []) {
        // If url have ?elementor-preview
        if (window.location.href.indexOf("?elementor-preview") != -1) {
            // Exit
            this.consoleLog("「ARMMANE」 Development mode is enabled, Script will not run", "WARN");
            return;
        }
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
            "commandMode" : false,
            "manualControl" : false, // Trigger whwn manual control is active in 10 last second
            "manualControlTrigger" : null, // Store the timeout function
            "sensorWarningTrigger" : null, // Store the timeout function

        }

        this.elements = {
            "mode" : ["btn", "form", "ui", "screen", "template","text"],
            "screen" : {
                "errorloading" : this.querySel(".scr-errload"),
                "loading" : this.querySel(".scr-loading"),
                "connect" : this.querySel(".scr-connect"),
                "main" : this.querySel(".scr-main"),
            },
            "ui" : {
                "statusarea" : this.querySel(".main-statusarea"),
                "controlarea" : this.querySel(".main-controlarea"),
                "settingarea" : this.querySel(".main-settingarea"),
                "statusbox" : this.querySel(".main-statusbox"),
                "controlbox" : this.querySel(".main-controlbox"),
                "cconfbox" : this.querySel("cconfbox"),
                "logmane" : this.querySel(".logmane"),
                "log_disconnect" : this.querySel(".log-disconnect"),
                "log_area" : this.querySel(".log-area"),
                "log_disconnect" : this.querySel(".log-disconnect"),
                "box_serverlist" : this.querySel(".box-serverlist"),
                "status_inf_trigger" : this.querySel(".status-inf-triggered"),
                "status_inf_idle" : this.querySel(".status-inf-idle"),
                "status_conv00_forward" : this.querySel(".status-conv00-fw"),
                "status_conv00_backward" : this.querySel(".status-conv00-bw"),
                "status_conv00_stop" : this.querySel(".status-conv00-stop"),
                "status_conv01_stop" : this.querySel(".status-conv01-stop"),
                "status_conv01_forward" : this.querySel(".status-conv01-fw"),
                "status_conv01_backward" : this.querySel(".status-conv01-bw"),
                "command_area" : document.querySelectorAll(".ins-command-area"),
                "function_box" : document.querySelectorAll(".ins-func-box"),
                "livepreview" : this.querySel(".livepreview"),
            },
            "btn" : {
                "conn_connectsrv" : this.querySel(".btn-connectsrv"),
                "status_toggle" : this.querySel(".btn-status-toggle"),
                "main_info" : this.querySel(".btn-main-info"),
                "main_control" : this.querySel(".btn-main-control"),
                "main_config" : this.querySel(".btn-main-config"),
                "error_btn_selectserver" : this.querySel(".err-btn1"),
                "error_btn_retry" : this.querySel(".err-btn2"),
                "cconf_btn_save" : this.querySel(".cconf-btn-save"),
                "cconf_btn_cancel" : this.querySel(".cconf-btn-cancel"),
            },
            "form" : {
                "conn_address_field" : this.querySel("#form-field-srvaddress"),
                "servo_00" : this.querySel("#form-field-s0"),
                "servo_01" : this.querySel("#form-field-s1"),
                "servo_02" : this.querySel("#form-field-s2"),
                "servo_03" : this.querySel("#form-field-s3"),
                "servo_04" : this.querySel("#form-field-s4"),
                "servo_05" : this.querySel("#form-field-s5"),
                "conv_00" : this.querySel("#form-field-conv0"),
                "conv_01" : this.querySel("#form-field-conv1"),
                "cconf_01" : this.querySel("#form-field-cconf-s1"),
                "cconf_02" : this.querySel("#form-field-cconf-s2"),
                "cconf_03" : this.querySel("#form-field-cconf-s3"),
            },
            "template" : {
                "btn_serverlist" : this.querySel(".tp-btn-server"),
                "log_alert" : this.querySel(".tp-log-alert"),
                "ins_function" : document.querySelectorAll(".tp-ins-func"),
                "code_block" : this.querySel(".tp-ins-code-block"),
            },
            "text" : {
                "connect_url" : this.querySel(".connecting-url").querySelector("div > h2"),
                "connect_status" : this.querySel(".connecting-status").querySelector("div > h2"),
                "cconf_title_1" : this.querySel(".cconf-title-1").querySelector("div > h2"),
                "cconf_title_2" : this.querySel(".cconf-title-2").querySelector("div > h2"),
                "cconf_title_3" : this.querySel(".cconf-title-3").querySelector("div > h2"),
                "prediction_class" : this.querySel(".prediction-class").querySelector("div > h2"),
            }
        }

        this.conf_list = [
            {
                "type" : "servo",
                "value" : 0,
                "min" : 0,
                "max" : 180,
            },
            {
                "type" : "conv",
                "value" : 0,
                "min" : 0,
                "max" : 2,
            }

        ];

        this.eventSource = null;
        this.videoStream = null;
        
        // this.uiElements = {
        //     "arm-status" : this.querySel(".arm-status > div > h2"),
        //     "amn-icon" : this.querySel(".amn-icon"),
        //     "amn-config-box" : this.querySel(".amn-config-box"),
        //     "amn-info-box" : this.querySel(".amn-info-box"),
        //     "btn-info" : this.querySel(".btn-info"),
        //     "btn-control" : this.querySel(".btn-control"),
        //     "btn-config" : this.querySel(".btn-config"),
        //     "btn-config-inner" : this.querySel(".btn-config > div > div > a"),
        //     "btn-preset-temp" : this.querySel(".btn-preset-temp"),
        //     "btn-s-control" : this.querySel(".btn-s-control"),
        //     "chip-servo-0" : this.querySel(".chip-servo-0 div > h4"),
        //     "chip-servo-1" : this.querySel(".chip-servo-1 div > h4"),
        //     "chip-servo-2" : this.querySel(".chip-servo-2 div > h4"),
        //     "chip-servo-3" : this.querySel(".chip-servo-3 div > h4"),
        //     "chip-servo-4" : this.querySel(".chip-servo-4 div > h4"),
        //     "chip-servo-5" : this.querySel(".chip-servo-5 div > h4"),
        //     "conf-cur-selmodel" : this.querySel(".conf-cur-selmodel > div > h6"),
        //     "conf-cur-conv1" : this.querySel(".conf-cur-conv1 > div > h6"),
        //     "conf-cur-conv2" : this.querySel(".conf-cur-conv2 > div > h6"),
        //     "form-field-s0" : this.querySel("#form-field-s0"),
        //     "form-field-s1" : this.querySel("#form-field-s1"),
        //     "form-field-s2" : this.querySel("#form-field-s2"),
        //     "form-field-s3" : this.querySel("#form-field-s3"),
        //     "form-field-s4" : this.querySel("#form-field-s4"),
        //     "form-field-s5" : this.querySel("#form-field-s5"),
        //     "form-field-conv1" : this.querySel("#form-field-conv1"),
        //     "form-field-conv2" : this.querySel("#form-field-conv2"),
        //     "form-field-selmodel" : this.querySel("#form-field-selmodel"),
        //     "list" : this.querySelAll(".list"),
        //     "swim-lane" : this.querySelAll(".swim-lane"),
            
        // };
        // this.config = [];
        // this.controlMode = 0;
        // this.convMode = ["หยุด", "เดินหน้า", "ถอยหลัง"];

        this.init();
    }




    
    /**
     * The init function sets up the initial state of the app.
     */
    init() {
        this.consoleLog("「ARMMANE」 by Nattawut Manjai-araya  v1.5.0 Build 202309280147");

        // Hide element log_disconnect
        this.hideElement("ui", "log_disconnect");

        // Create server selection button
        this.createServerSelectionButton();

        // Show loading screen
        this.showScreen("connect", true);

        this.setupElementTrigger();

        this.createDraggableList();

        this.dragNdrop();
    }



    
    /**
     * The setTriggerEvent function is used to assign an event listener to a specific element.
     * @param mode Determine which element is being used
     * @param element_name Identify the element that will be assigned to the event
     * @param event Determine which event to listen for
     * @param func Define the function that will be executed when the event is triggered
     */
    setTriggerEvent(mode, element_name, event, func) {
        if (!this.elements["mode"].includes(mode)) {
            this.consoleLog("「ARMMANE」 Mode " + mode + " not found", "ERROR");
            return;
        }
        this.elements[mode][element_name].addEventListener(event, func);
        this.consoleLog("「ARMMANE」 Element " + element_name + " assigned to " + event + " event");
    }

    //this.querySel with error handling
    querySel(element, doc = document) {
        try {
            return doc.querySelector(element);
        } catch (error) {
            this.consoleLog("「ARMMANE」 Element " + element + " not found", "ERROR");
        }
    }

    querySelAll(element, doc = document) {
        try {
            return doc.querySelectorAll(element);
        } catch (error) {
            this.consoleLog("「ARMMANE」 Element " + element + " not found", "ERROR");
        }
    }

    
    /**
     * The setupElementTrigger function sets up the event listeners for each element.
    */
    setupElementTrigger() {
        // status_toggle
        this.setTriggerEvent("btn", "status_toggle", "click", () => {
            this.toggleStatusInfo();
        });
        //conn_connectsrv
        this.setTriggerEvent("btn", "conn_connectsrv", "click", () => {
            let serverdata = this.getServerURLFromFields();
            try{
                this.changeServer(serverdata[0], serverdata[1], serverdata[2]);
                this.alertLog("กำลังเชื่อมต่อเซิร์ฟเวอร์: " + this.appStatus["server"]["fullURL"], "กรุณารอสักครู่", "info-circle", "#FF006E", 5000);
            }catch(error){
                this.consoleLog("「ARMMANE」 Server Address is invalid", "ERROR");
            }
        });

        // error_btn_selectserver
        this.setTriggerEvent("btn", "error_btn_selectserver", "click", () => {
            this.showScreen("connect", true);
        });

        // error_btn_retry
        this.setTriggerEvent("btn", "error_btn_retry", "click", () => {
            this.connect();
        });

        // let element_fw = this.elements["ui"]["status_conv" + conv + "_forward"].querySelector(".elementor-icon");
        // let element_bw = this.elements["ui"]["status_conv" + conv + "_backward"].querySelector(".elementor-icon");
        // let element_stop = this.elements["ui"]["status_conv" + conv + "_stop"].querySelector(".elementor-icon");

        for (let conv = 0; conv < 2; conv++) {
            this.setTriggerEvent("form", "conv_0" + conv, "change", () => {
                this.controlConv(conv, -1, this.elements["form"]["conv_0" + conv].value);
                this.consoleLog("Live update is paused");
                this.appStatus["manualControl"] = true;
                clearTimeout(this.appStatus["manualControlTrigger"]);
                this.appStatus["manualControlTrigger"] = setTimeout(() => {
                    this.consoleLog("Live update is resumed");
                    this.appStatus["manualControl"] = false;
                }, 10000);
            });

            this.setTriggerEvent("ui", "status_conv0" + conv + "_forward", "click", () => {
                this.controlConv(conv, 1, -1);
            });

            this.setTriggerEvent("ui", "status_conv0" + conv + "_backward", "click", () => {
                this.controlConv(conv, 2, -1);
            });

            this.setTriggerEvent("ui", "status_conv0" + conv + "_stop", "click", () => {
                this.controlConv(conv, 0, -1);
            });
        }

        for (let servo = 0; servo < 6; servo++) {
            this.setTriggerEvent("form", "servo_0" + servo, "change", () => {
                this.consoleLog("Live update is paused");
                this.controlServo(servo, this.elements["form"]["servo_0" + servo].value);
                // set manual control trigger to true
                this.appStatus["manualControl"] = true;
                // set manual control trigger to false after 10 second
                clearTimeout(this.appStatus["manualControlTrigger"]);
                this.appStatus["manualControlTrigger"] = setTimeout(() => {
                    this.consoleLog("Live update is resumed");
                    this.appStatus["manualControl"] = false;
                }, 10000);
                
            });
        }

        this.setTriggerEvent("btn", "main_info", "click", () => {
            this.mainArea("info");
        });

        this.setTriggerEvent("btn", "main_control", "click", () => {
            this.mainArea("control");
        }
        );

        this.setTriggerEvent("btn", "main_config", "click", () => {
            this.mainArea("setting");
        }
        );


    }

    
    /**
     * The toggleStatusInfo function toggles the display of the log area.
     */
    toggleStatusInfo() {
        if (this.elements["ui"]["log_area"].style.display == "none") {
            this.elements["ui"]["log_area"].style.display = "flex";
        }else{
            this.elements["ui"]["log_area"].style.display = "none";
        }
    }



    /**
     * The showScreen function shows the screen that was specified.
     * @param screen_name Identify which screen to show
     */
    showScreen(screen_name, hide_all = false) {
        if (hide_all) {
            this.hideAllScreen();
        }
        this.elements["screen"][screen_name].style.display = "flex";
        this.appStatus["currentScreen"] = screen_name;
    }


    
    /**
     * The hideScreen function hides the screen that was specified.
     * @param screen_name Identify which screen to hide
     */
    hideScreen(screen_name) {
        this.elements["screen"][screen_name].style.display = "none";
    }



    
    /**
     * The hideAllScreen function hides all the screens from the UI.
     */
    hideAllScreen() {
        for (var key in this.elements["screen"]) {
            this.hideScreen(key);
        }
    }



    
    /**
     * The createServerSelectionButton function creates a button for each server in the server list.
     * The buttons are added to the UI element with id "box_serverlist".
     */
    createServerSelectionButton() {
        for (var i = 0; i < this.appStatus["serverList"].length; i++) {
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
            newdiv.port = this.appStatus["serverList"][i]["port"];
            newdiv.protocol = this.appStatus["serverList"][i]["protocol"];
            // Add event listener to button
            newdiv.addEventListener("click", () => {
                // Called function to change server
                this.changeServer(newdiv.address, newdiv.port, newdiv.protocol);
            });
            // Append button to [ui][box_serverlist]>div>newdiv
            this.elements["ui"]["box_serverlist"].querySelector("div").appendChild(newdiv);
        }
    }

    
    /**
     * The changeServer function changes the server that the app is connected to.
     * @param address Set the address of the server
     * @param port Set the port number of the server
     * @param protocol Change the protocol of the server
     */
    changeServer(address, port, protocol) {
        this.appStatus["server"]["address"] = address;
        this.appStatus["server"]["port"] = port;
        this.appStatus["server"]["protocol"] = protocol;
        this.appStatus["server"]["fullURL"] = protocol + "://" + address + (port ? ":" + port : "");
        this.consoleLog("「ARMMANE」 Server changed to " + this.appStatus["server"]["fullURL"]);
        this.connectToServer();
    }


    /**
     * The connectToServer function connects the app to the server.
     */
    connectToServer() {
        this.consoleLog("「ARMMANE」 Connecting to server at " + this.appStatus["server"]["fullURL"]);
        this.changeText("connect_url", this.appStatus["server"]["fullURL"]);
        this.changeText("connect_status", "กำลังเตรียมเชื่อมต่อ");
        this.showScreen("loading", true);
        this.connect();
        // Wait for 3 seconds If connected show main screen
        setTimeout(() => {
            if (this.appStatus["connected"]) {
                this.mainScreen();
                this.hideElement("ui", "log_disconnect");
                this.consoleLog("「ARMMANE」 Connected to server at " + this.appStatus["server"]["fullURL"]);
                this.alertLog("เชื่อมต่อเซิร์ฟเวอร์สำเร็จ", "กำลังเข้าสู่หน้าหลัก", "info-circle", "#FF006E", 5000);
            }
        }, 3000);
        // Wait for 10 seconds If still not connected show error
        setTimeout(() => {
            if (!this.appStatus["connected"]) {
                this.showScreen("connect", true);
                this.hideElement("ui", "log_disconnect");
                this.consoleLog("「ARMMANE」 Connection to server at " + this.appStatus["server"]["fullURL"] + " failed", "ERROR");
                this.alertLog("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "กรุณาตรวจสอบการเชื่อมต่อ", "exclamation-triangle", "#B11D1D",5000);
                this.disconnect();
            }else{
                this.hideElement("ui", "log_disconnect");
                this.mainScreen();
            }
        }, 10000);
    }



    
    /**
     * The getServerURLFromFields function takes the value of the connection address field and parses it to determine
     * what protocol, port, and address should be used for connecting to a server.
     * @return An array of 3 elements:
     *        1. The address of the server
     *        2. The port number of the server
     *        3. The protocol of the server
     */
    getServerURLFromFields() {
        var address = this.elements["form"]["conn_address_field"].value;
        // saparate address and port if include protocol also
        var protocol = "https";
        var port = "";
        if (address.includes("https://")) {
            protocol = "https";
            address = address.replace("https://", "");
        }

        if (address.includes("http://")) {
            protocol = "http";
            address = address.replace("http://", "");
        }

        if (address.includes(":")) {
            var split = address.split(":");
            address = split[0];
            port = split[1];
        }

        if (protocol == "") {
            protocol = "https";
        }

        if (address == "") {
            address = "localhost";
        }

        // Regex to check if full address is valid
        var regex = new RegExp("^(http|https)://[^/]+(:[0-9]+)?$");
        if (!regex.test(this.elements["form"]["conn_address_field"].value)) {
            this.consoleLog("「ARMMANE」 Invalid address: " + this.elements["form"]["conn_address_field"].value, "ERROR");
            this.alertLog("ที่อยู่เซิร์ฟเวอร์ไม่ถูกต้อง: " + this.elements["form"]["conn_address_field"].value, "กรุณาตรวจสอบที่อยู่เซิร์ฟเวอร์", "exclamation-triangle", "#B11D1D",1000);
            return;
        }

        this.consoleLog("「ARMMANE」 Server address: " + address + ", Port: " + (port ? port : "default") + ", Protocol: " + protocol);
        return [address, port, protocol];

    }


    
    /**
     * The alertLog function creates a new alert log in the User Interface.
     * @param title Set the title of the alert
     * @param message Display the message in the alert
     * @param icon Set the icon of the alert
     * @param color Change the background color of the alert
     * @param time Set the time in milliseconds for which the alert will be displayed
     */
    alertLog(title, message, icon = null, color = null, time = 5000) {
        if (icon == null) {
            icon = "info-circle";
        }
        if (color == null) {
            color = "#B11D1D";
        }
        let alertdiv = this.elements["template"]["log_alert"].cloneNode(true);
        alertdiv.classList.remove("tp-log-alert");
        let randomid = Math.floor(Math.random() * 1000000);
        alertdiv.classList.add("log-alert-" + randomid);
        alertdiv.querySelector("div").style.backgroundColor = color;
        alertdiv.querySelector(".err-icon").querySelector("div > i").className = "fas fa-" + icon;
        alertdiv.querySelector(".err-icon").querySelector("div > i").style.color = color;
        alertdiv.querySelector(".err-title").querySelector("div > h2").textContent = title;
        alertdiv.querySelector(".err-subtitle").querySelector("div > h5").textContent = message;
        alertdiv.style.display = "flex";
        alertdiv.style.visibility = "visible";
        alertdiv.addEventListener("click", () => {
            try {
                this.elements["ui"]["logmane"].querySelector("div").removeChild(alertdiv);
            } catch (error) {
                this.consoleLog("Already removed the element maybe by click" + error, "WARN");
            }     
        }
        );
        this.elements["ui"]["logmane"].querySelector("div").insertBefore(alertdiv, this.elements["ui"]["logmane"].querySelector("div").childNodes[2]);
        setTimeout(() => {
            try {
                this.elements["ui"]["logmane"].querySelector("div").removeChild(alertdiv);
            } catch (error) {
                this.consoleLog("Already removed the element maybe by click" + error, "WARN");
            }
            
        }, time);
    }

    //This will change the property of the element after click save button
    openConfigBox(element){
        
    }



    
    /**
     * The connect function connects to the server via SSE and sets up event listeners for Server Sent Events.
     */
    connect() {
        this.updateConnectionStatus("กำลังเชื่อมต่อกับเซิร์ฟเวอร์");
    
        if (this.appStatus["connected"] || this.eventSource !== null) {
            this.updateConnectionStatus("มีการเชื่อมต่ออยู่แล้ว กำลังตัดการเชื่อมต่อ");
            this.disconnect();
            this.appStatus["connected"] = false;
        }
    
        this.eventSource = new EventSource(this.appStatus["server"]["fullURL"] + "/sse/status");
        this.videoStream = new EventSource(this.appStatus["server"]["fullURL"] + "/sse/videostream");
    
        this.eventSource.onopen = () => {
            this.updateConnectionStatus("กำลังเชื่อมต่อกับเซิร์ฟเวอร์");
            this.consoleLog("[INFO] SSE connecting to " + this.appStatus["server"]["fullURL"]);
        };
    
        this.eventSource.onerror = () => {
            this.handleConnectionError();
        };
    
        this.eventSource.onmessage = (event) => {
            this.handleMessage(event.data);
        };

        this.eventSource.addEventListener("arm_status", (event) => {
            this.consoleLog("[INFO] SSE arm_status: " + event.data);
            this.handleArmStatus(event.data);
        });

        this.videoStream.addEventListener("prediction", (event) => {
            this.consoleLog("[INFO] SSE received prediction data");
            this.handlePrediction(event.data);
        });
    }
    
    
    /**
     * The updateConnectionStatus function updates the text of the connection status element.
     * @param status Update the text of the connect_status element
     */
    updateConnectionStatus(status) {
        this.changeText("connect_status", status);
    }
    

    
    /**
     * The handleConnectionError function is called when the connection to the server is lost.
     * It updates the connection status and logs a message in console.
     */
    handleConnectionError() {
        this.updateConnectionStatus("เกิดข้อผิดพลาดในการเชื่อมต่อ กำลังลองเชื่อมต่อใหม่");
        this.consoleLog("[INFO] SSE disconnected from " + this.appStatus["server"]["fullURL"], "WARN");
    
        if (this.appStatus["currentScreen"] === "main") {
            this.appStatus["isDisconnecting"] = true;
            this.appStatus["connected"] = false;
            this.showElement("ui", "log_disconnect");
            this.disconnect();
        }
    }
    
    
    /**
     * The handleMessage function is called when the SSE connection receives a message.
     * It checks if the app is in loading or connect screens, and if so, it switches to main screen.
     * If not, it logs that the SSE has connected to a server.
     * @param data Data received from the server
     */
    handleMessage(data) {
        console.log(data);
    
        if (this.appStatus["currentScreen"] === "main") {
            if (this.appStatus["isDisconnecting"] || !this.appStatus["connected"]) {
                this.consoleLog("[INFO] SSE connected to " + this.appStatus["server"]["fullURL"]);
                this.appStatus["isDisconnecting"] = false;
                this.appStatus["connected"] = true;
                this.hideElement("ui", "log_disconnect");
            }
        }
    
        if (this.appStatus["currentScreen"] === "loading" || this.appStatus["currentScreen"] === "connect") {
            this.appStatus["isDisconnecting"] = false;
            this.appStatus["connected"] = true;
            setTimeout(() => {
                this.mainScreen();
            }, 1000);
            this.consoleLog("[INFO] SSE connected to " + this.appStatus["server"]["fullURL"]);
        }
    
    }

    
    /**
     * The disconnect function closes the eventSource and sets the appStatus["connected"] to false.
     */
    disconnect() {
        this.eventSource.close();
        this.appStatus["connected"] = false;
        this.eventSource = null;
        this.consoleLog("[INFO] SSE disconnected from " + this.appStatus["server"]["fullURL"],"WARN");
    }


    
    /**
     * The mainScreen function is used to show the main screen.
     */
    mainScreen() {
        this.showScreen("main", true);
    }

    mainArea(area){
        switch (area) {
            case "info":
                this.showElement("ui", "statusbox");
                this.hideElement("ui", "controlbox");
                this.showElement("ui", "statusarea");
                this.hideElement("ui", "settingarea");
                this.appStatus["commandMode"] = false;
                for (let servo = 0; servo < 6; servo++) {
                    this.elements["form"]["servo_0" + servo].disabled = true;
                }
                for (let conv = 0; conv < 2; conv++) {
                    this.elements["form"]["conv_0" + conv].disabled = true;
                }                
                break;               
            case "control":
                this.hideElement("ui", "statusbox");
                this.showElement("ui", "controlbox");
                this.showElement("ui", "statusarea");
                this.hideElement("ui", "settingarea");
                this.appStatus["commandMode"] = true;
                for (let servo = 0; servo < 6; servo++) {
                    this.elements["form"]["servo_0" + servo].disabled = false;
                }
                for (let conv = 0; conv < 2; conv++) {
                    this.elements["form"]["conv_0" + conv].disabled = false;
                }
                break;
            case "setting":
                this.hideElement("ui", "statusarea");
                this.showElement("ui", "settingarea");
                break;
            default:
                break;
        }
    }


    
    /**
     * The handleArmStatus function is used to update the arm status in the UI.
     * @param data Store the data received from the server
     */
    handleArmStatus(data) {
        let armStatus = JSON.parse(data);
        if ((!this.appStatus["commandMode"]) || (!this.appStatus["manualControl"])) {
            for (let servo = 0; servo < 6; servo++) {
                this.elements["form"]["servo_0" + servo].value = armStatus["servo"][servo];
            }
            for (let conv = 0; conv < 2; conv++) {
                this.elements["form"]["conv_0" + conv].value = armStatus["conv"]["speed"][conv];
            }
        }else{
        }
        this.handleConvStatus(0, armStatus["conv"]["mode"][0]);
        this.handleConvStatus(1, armStatus["conv"]["mode"][1]);
        this.handleInfStatus(armStatus["sensor"]);
    }


    handlePrediction(data) {
        let prediction = JSON.parse(data);
        this.changeText("prediction_class", "Class: " + prediction["class"] + " (" + prediction["confident_score"] + "%) <br> " + prediction["fps"] + " FPS <br> Detected:" + prediction["detect_flag"] + " ");
        this.elements["ui"]["prediction_img"].src = "data:image/jpeg;base64," + prediction["current_frame"];
    }


    
    /**
     * The handleConvStatus function is used to change the color of the icons in the status section.
     * @param conv Identify the conveyor
     * @param value Mode of the conveyor
     */
    handleConvStatus(conv, value) {
        // active = #F7496A , inactive = #FCA5B6
        // this.querySel(".status-conv00-fw").querySelector(".elementor-icon").style.backgroundColor = "#F7496A"
        // equal to this.elements["ui"]["status_conv00_forward"].querySelector(".elementor-icon").style.backgroundColor = "#F7496A"
        // fill zero
        let active = "#F7496A";
        let inactive = "#FCA5B6";
        if (conv < 10) {
            conv = "0" + conv;
        }
        let element_fw = this.elements["ui"]["status_conv" + conv + "_forward"].querySelector(".elementor-icon");
        let element_bw = this.elements["ui"]["status_conv" + conv + "_backward"].querySelector(".elementor-icon");
        let element_stop = this.elements["ui"]["status_conv" + conv + "_stop"].querySelector(".elementor-icon");

        element_fw.style.backgroundColor = inactive;
        element_bw.style.backgroundColor = inactive;
        element_stop.style.backgroundColor = inactive;

        switch (value) {
            case 0:
                element_stop.style.backgroundColor = active;
                break;
            case 1:
                element_fw.style.backgroundColor = active;
                break;
            case 2:
                element_bw.style.backgroundColor = active;
                break;
            default:
                break;
        }
        
    }



    
    /**
     * The handleInfStatus function is used to update the UI of the sensor status.
     * @param data Get the value and available from the data object
     */
    handleInfStatus(data) {
        let value = data["value"];
        let available = data["available"];
        // active = #F7496A , inactive = #FCA5B6
        let active = "#F7496A";
        let inactive = "#FCA5B6";
        let warning = "rgb(255 86 7)";
        let element_trigger = this.elements["ui"]["status_inf_trigger"].querySelector(".elementor-icon");
        let element_idle = this.elements["ui"]["status_inf_idle"].querySelector(".elementor-icon");
        if (available == 0 || available == false) {
            if (this.appStatus["sensorWarningTrigger"] == null) {
                this.appStatus["sensorWarningTrigger"] = setInterval(() => {
                    this.playSound("https://design.nicezki.com/dev/sound/red-beep.mp3");
                    element_trigger.style.backgroundColor = warning;
                    element_idle.style.backgroundColor = warning;
                    setTimeout(() => {
                        element_trigger.style.backgroundColor = inactive;
                        element_idle.style.backgroundColor = inactive;
                    }
                    , 500);
                }, 1000);
                this.alertLog("เซ็นเซอร์ไม่พร้อมใช้งาน", "กรุณาตรวจสอบเซ็นเซอร์", "exclamation-triangle", "#B11D1D", 5000);
            }
            element_trigger.style.backgroundColor = inactive;
            element_idle.style.backgroundColor = inactive;
        }
        else if (value == 0 || value == false) {
            if (this.appStatus["sensorWarningTrigger"] != null) {
                clearInterval(this.appStatus["sensorWarningTrigger"]);
                this.appStatus["sensorWarningTrigger"] = null;
            }
            element_trigger.style.backgroundColor = inactive;
            element_idle.style.backgroundColor = active;
        }else if (value == 1 || value == true) {
            if (this.appStatus["sensorWarningTrigger"] != null) {
                clearInterval(this.appStatus["sensorWarningTrigger"]);
                this.appStatus["sensorWarningTrigger"] = null;
            }
            this.playSound("https://design.nicezki.com/dev/sound/beep-2.mp3");
            element_trigger.style.backgroundColor = active;
            element_idle.style.backgroundColor = inactive;
        }else{

        }
    }

    
    /**
     * The playSound function plays a sound.
     * @param sound Pass in the sound file that is to be played
     */
    playSound(sound) {
        let audio = new Audio(sound);
        audio.play();
    }


    // setStatus(status,


    // connect() {
    //     let ssesource = this.setupSSE();
    //     if (ssesource) {
    //         this.consoleLog("Connected to server at " + this.appStatus["server"]["fullURL"]);
    //         this.appStatus["connected"] = true;
    //         // Delay 1 second to show main screen

    //     }else{
    //         this.consoleLog("Connection to server at " + this.appStatus["server"]["fullURL"] + " failed", "ERROR");
    //         this.appStatus["connected"] = false;
    //     }
    // }

























// Shit code still need to be clear
// DEPRECATED them all!!

    // initialize drag and drop function
    dragNdrop() {
        const draggables = Array.from(this.elements["template"]["code_block"]);
        const droppables = Array.from(this.elements["ui"]["command_area"]);

        // Add dragstart and dragend event listeners to draggable elements
        draggables.forEach(list => {
            list.addEventListener("dragstart", () => {
                list.classList.add("dragging");
            });
            list.addEventListener("dragend", () => {
                list.classList.remove("dragging");
            });

            // Enable draggable behavior
            list.draggable = true;
        });

        // Add dragover event listeners to droppable zones
        droppables.forEach(zone => {
            zone.addEventListener("dragover", (e) => {
                e.preventDefault();
                const bottomList = this.insertAboveList(zone, e.clientY);
                const curList = this.querySel(".dragging");
                if (!bottomList) {
                    zone.appendChild(curList);
                } else {
                    zone.insertBefore(curList, bottomList);
                }
            });
        });
    }

    // Insert draggable list above a target list based on mouseY
    insertAboveList(zone, mouseY) {
        const els = Array.from(zone.querySelectorAll(".tp-ins-code-block:not(.dragging)"));
        let closestList = null;
        let closestOffset = Number.NEGATIVE_INFINITY;
    
        els.forEach(list => {
            const { top, width } = list.getBoundingClientRect();
            const offset = mouseY - top; // Calculate the offset from the top edge
            if (offset < 0 && offset > closestOffset) {
                closestList = list;
                closestOffset = offset;
            }
        });
        return closestList;
    }
    
    getData() {
        const commandArea = this.querySel(".ins-command-area"); // Assuming this is your command_area

        // Initialize an array to store the data
        const data = [];

        // Iterate through the child elements of command_area
        const codeBlocks = Array.from(commandArea.querySelectorAll(".tp-ins-code-block"));
        codeBlocks.forEach(codeBlock => {
            // Extract the data you need from each codeBlock
            const type = codeBlock.getAttribute("data-type"); // Example: "servo" or "conv"
            const value = codeBlock.getAttribute("data-value"); // Example: Numeric value associated with the code block
            // Add the extracted data to the data array
            data.push({
                type,
                value
            });
        });

        return data;
    }

    createDraggableList() {
        const spawnArea = this.elements["ui"]["function_box"][0].querySelector("div");
    
        for (let i = 0; i < this.conf_list.length; i++) {
            // Create a new element
            let newDiv = this.elements["template"]["ins_function"][0].cloneNode(true);
    
            // Set the class and text content
            newDiv.classList.add("ins_function", "" + i);
            newDiv.querySelector(".tp-ins-func > div > h4").textContent = this.conf_list[i]["type"];
            newDiv.style.display = "flex";
    
            // Add data attributes to store custom data
            newDiv.type = this.conf_list[i]["type"];
            newDiv.value = this.conf_list[i]["value"];
            newDiv.min = this.conf_list[i]["min"];
            newDiv.max = this.conf_list[i]["max"];
            newDiv.setAttribute("data-type", this.conf_list[i]["type"]);
            newDiv.setAttribute("data-value", this.conf_list[i]["value"]);
    
            // Add a click event listener to clone the element to the swim-lane
            newDiv.addEventListener("click", () => {
                // Check the type of the clicked element
                if (newDiv.type === "servo") {
                    // Clone this.elements["tp-ins-code-block"]
                    const clonedCodeBlock = this.elements["template"]["code_block"].cloneNode(true);
                    clonedCodeBlock.querySelector(".cmd-del").addEventListener("click", () => {
                        clonedCodeBlock.remove();
                    });
                    clonedCodeBlock.querySelector(".cmd-edit").addEventListener("click", () => {
                        this.consoleLog("「ARMMANE」 Edit command");
                    });
                    clonedCodeBlock.querySelector(".cmd-play").addEventListener("click", () => {
                        this.consoleLog("「ARMMANE」 Run command");
                    });
                    clonedCodeBlock.setAttribute("data-type", newDiv.type);
                    clonedCodeBlock.setAttribute("data-value", newDiv.value);
    
                    // Remove the click event listener from the cloned element

                    clonedCodeBlock.removeEventListener("click", () => {});
    
                    // Add a dragstart event listener to make it draggable within the swim-lane
                    clonedCodeBlock.addEventListener("dragstart", (e) => {
                        clonedCodeBlock.classList.add("dragging");
                        // Set a custom data attribute to track the element's origin
                        e.dataTransfer.setData("origin", "command_area");
                    });
    
                    // Add a dragend event listener to remove the dragging class
                    clonedCodeBlock.addEventListener("dragend", () => {
                        clonedCodeBlock.classList.remove("dragging");
                    });
    
                    // Enable draggable behavior for the cloned element
                    clonedCodeBlock.draggable = true;
    
                    // Append the cloned element to the swim-lane
                    const swimLane = this.elements["ui"]["command_area"][0];
                    swimLane.appendChild(clonedCodeBlock);
                } else if (newDiv.type === "conv") {
                    // Clone this.elements["tp-ins-code-block"]
                    const clonedCodeBlock = this.elements["template"]["code_block"].cloneNode(true);
                    clonedCodeBlock.querySelector(".cmd-text > div > h2").textContent = "setConV(0,1);";
                    clonedCodeBlock.querySelector(".cmd-del").addEventListener("click", () => {
                        clonedCodeBlock.remove();
                    });
                    clonedCodeBlock.querySelector(".cmd-edit").addEventListener("click", () => {
                        this.consoleLog("「ARMMANE」 Edit command");
                    });
                    clonedCodeBlock.querySelector(".cmd-play").addEventListener("click", () => {
                        this.consoleLog("「ARMMANE」 Run command");
                    });
                    clonedCodeBlock.setAttribute("data-type", newDiv.type);
                    clonedCodeBlock.setAttribute("data-value", newDiv.value);
    
                    // Remove the click event listener from the cloned element
                    clonedCodeBlock.removeEventListener("click", () => {});
    
                    // Add a dragstart event listener to make it draggable within the swim-lane
                    clonedCodeBlock.addEventListener("dragstart", (e) => {
                        clonedCodeBlock.classList.add("dragging");
                        // Set a custom data attribute to track the element's origin
                        e.dataTransfer.setData("origin", "command_area");
                    });
    
                    // Add a dragend event listener to remove the dragging class
                    clonedCodeBlock.addEventListener("dragend", () => {
                        clonedCodeBlock.classList.remove("dragging");
                    });
    
                    // Enable draggable behavior for the cloned element
                    clonedCodeBlock.draggable = true;
    
                    // Append the cloned element to the swim-lane
                    const swimLane = this.elements["ui"]["command_area"][0];
                    swimLane.appendChild(clonedCodeBlock);
                }
            });
    
            // Append the new element to the spawn area
            spawnArea.appendChild(newDiv);
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
        fetch(this.appStatus["server"]["fullURL"] + "/command/servo/" + servo + "/" + value, {
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

    controlConv(conv, mode, speed = -1) {
        // send POST api to server
        fetch(this.appStatus["server"]["fullURL"] + "/command/conv/" + conv + "/" + mode + "/" + speed, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then(data => {
            this.consoleLog("「ARMMANE」 Conveyor "+conv+" mode changed to "+mode + (speed != -1 ? " with speed " + speed : ""));
        })
        .catch(err => {
            console.log(err);
        });
    }

        


    async getDataFromAPI(path, value = "") {
        if(value != "") {
            this.consoleLog("「ARMMANE」 POST " + this.appStatus["server"]["fullURL"] + "/" + path + "/" + value);
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

    
    /**
     * The showElement function is used to show an element in the UI.
     * 
     *
     * @param mode Determine which mode is being used
     * @param element_name Determine which element to show
     *
     * @return Nothing
     */
    showElement(mode, element_name) {
        if (!this.elements["mode"].includes(mode)) {
            this.consoleLog("「ARMMANE」 Mode " + mode + " not found", "ERROR");
            return;
        }
        this.elements[mode][element_name].style.display = "flex";
    }


    /**
     * The hideElement function is used to hide an element in the UI.
     * 
     * 
     * @param mode Determine which mode is being used
     * @param element_name Determine which element to hide
     * 
     * @return Nothing
     * 
     **/
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
        this.elements["text"][element_name].textContent = text;
    }

    getText(element_name) {
        return this.elements["text"][element_name].textContent;
    }

    changeIcon(element_name, icon) {
        let icon_name = "fas fa-" + icon;
        this.elements["icon"][element_name].className = icon_name;
    }

    getIcon(element_name) {
        return this.elements["icon"][element_name].className;
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

    
    /**
     * The consoleLog function is a wrapper for the console.log function that allows you to specify
     * a type of message (INFO, SUCCESS, WARN, ERROR) and have it displayed in the console with
     * an appropriate background color. You can also specify your own custom color if you want to
     * use this function for something other than displaying messages from ArmMane. The Bold and Italic
     * parameters allow you to apply those styles as well if desired. 
     
     *
     * @param Text Display the text in the console (required)
     * @param Type Specify the type of log message (INFO, SUCCESS, WARN, ERROR) (optional)
     * @param Color Set the background color of the text (optional)
     * @param Bold Apply a bold style to the text (optional)
     * @param Italic Make the text italic (optional)
    consolelog(&quot;this is a test&quot;, &quot;info&quot;, &quot;green&quot;, true, true);
    
    console
     *
     * @return Undefined
     *
     */
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

// If url not have ?elementor-preview
if (window.location.href.indexOf("?elementor-preview") == -1) {
    // Create new instance of ARMMane
    var app = new ARMMane();
}
else{
    console.log("「ARMMANE」 Development mode is enabled");
}
