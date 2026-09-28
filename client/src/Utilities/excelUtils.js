import * as XLSX from "xlsx";

// Excel-parsing helpers live in their own module so the large xlsx library
// is only downloaded by the Upload Excel page, not by every page.


/**
  * get selected excel file data
  * @param evt current tag event
  */
export function getSelectedFileData(e) {
    // /* wire up file reader */
    const target = e.target;
    if (target.files.length !== 1) throw new Error("Cannot use multiple files");
    return new Promise((res, rej) => {
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(e.target.files[0]);
        fileReader.onload = () => {
            let arrayBuffer = fileReader.result;
            var data = new Uint8Array(arrayBuffer);
            var arr = new Array();
            for (var i = 0; i != data.length; ++i)
                arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
            var workbook = XLSX.read(bstr, {
                type: "binary",
                cellDates: true,
                cellNF: false,
                cellText: false,
            });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            var arraylist = XLSX.utils.sheet_to_json(worksheet, {
                raw: false,
                dateNF: "dd/mm/yyyy",
                // header: "A",
                defval: "",
            });
            console.log("arrayList raw: true,defval: '' =>", arraylist);
            //  filelist = [];
            // console.log(arraylist);
            // let workBook = workbook;
            // let outputData = arraylist;
            // const result = {
            //   data: arraylist,
            //   workbook: workbook,
            // };
            if (arraylist.length > 0) {
                //  console.log("rows is ==>", arraylist);
                loadData(workbook, arraylist)
                    .then((data) => {
                        res(data);
                    })
                    .catch((err) => {
                        alert(
                            "there is not any data available. please add atlease one data"
                        );
                        rej(new Error("no data found on selected excel file", err));
                    });
            } else {
                alert("there is not any data available. please add atlease one data");
                rej(new Error("no data found on selected excel file"));
            }
        };
    });
}


export function loadData(workBook, data, newSelectedVal) {
    let selectedWorkSheet, selectedWorkSheetName, convertedData, worksSheets, selectedWorkSheetNamesArray;
    return new Promise((res, rej) => {
        try {
            var worksheet;
            if (newSelectedVal) {
                selectedWorkSheet = newSelectedVal;
                selectedWorkSheetName = newSelectedVal;
                worksheet = workBook.Sheets[selectedWorkSheetName];
                convertedData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    dateNF: "dd/mm/yyyy",
                    defval: "",
                });
            } else {
                convertedData = data;
                selectedWorkSheetNamesArray = [];
                selectedWorkSheetNamesArray = workBook.SheetNames;
                worksSheets = [];
                worksSheets = workBook.Sheets;
                console.log("worksSheets ==>", worksSheets);
                selectedWorkSheet = 0;
                selectedWorkSheetName = workBook.SheetNames[0];
                worksheet = workBook.Sheets[selectedWorkSheetName];
            }
            let colums = Object.keys(convertedData[0]);
            let length = convertedData.length - 1;
            let lastLiteBillData = convertedData[length];
            if (newSelectedVal) {
                let objData = {
                    convertedData: convertedData,
                    colums: colums,
                    lastLiteBillData: lastLiteBillData,
                };
                res(objData);
            } else {
                let objData = {
                    selectedWorkSheet: selectedWorkSheet,
                    selectedWorkSheetName: selectedWorkSheetName,
                    workBook: workBook,
                    convertedData: convertedData,
                    selectedWorkSheetNamesArray: selectedWorkSheetNamesArray,
                    worksSheets: worksSheets,
                    colums: colums,
                    lastLiteBillData: lastLiteBillData,
                };
                res(objData);
            }
        } catch (error) {
            alert("there is not any data available. please add atlease one data");
            rej(new Error("no data found on selected excel file"));
        }
    });
}
