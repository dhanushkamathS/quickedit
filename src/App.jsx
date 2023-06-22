import { useState } from 'react'
import CodeEditor from './components/CodeEditor'
import OutputWindow from './components/OutputWindow'
import LanguagesDropdown from './components/LanguageDropdown'
import { languageOptions } from './constants/languageOptions'
import CustomInput from './components/CustomInput'
import { ToastContainer} from "react-toastify";
import { showErrorToast } from './utils/toast'
import axios from "axios";


function App() {
      const [code, setCode] = useState("// write some code");
      const [customInput, setCustomInput] = useState("");
      const [outputDetails, setOutputDetails] = useState(null);
      const [processing, setProcessing] = useState(null);
      const [language, setLanguage] = useState(languageOptions[0]);


  
      const onSelectChange = (sl) => { 
          setLanguage(sl);
      };

      const onChange = (action, data) => {
      switch (action) {
        case "code": {
          setCode(data);
          console.log(data)
          break;
        }
        default: {
          console.warn("case not handled!", action, data);
        }
      }
    };

   const handleCompile = () => {

    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };

  
    const options = {
        method: 'POST',
        url: process.env.REACT_APP_RAPID_API_URL,
        params: { base64_encoded: 'true', fields: '*'},
        headers: {
          'content-type': 'application/json',
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
          'X-RapidAPI-Host':  process.env.REACT_APP_RAPID_API_HOST
        },
      data: formData,
    };

     axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);
        }
        setProcessing(false);
         showErrorToast(`Quota of 50 requests exceeded for the Day!`,10000);
        console.log("catch block...", error);
      });
  };


   const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: process.env.REACT_APP_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host":  process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        // showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  return (
     <div className='h-screen bg-gray-800'>
        <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick = {true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover = {false}
      />

      <div className=' text-3xl text-center text-white p-3' >
        <p>Quick Edit (For your immediate needs)</p>
        {process.env.REACT_APP_RAPID_API_URL}
        {process.env.REACT_APP_RAPID_API_HOST}
        {process.env.REACT_APP_RAPID_API_KEY}
      </div>

      <div className="flex flex-row justify-center mb-2">

        <div className="px-4">
          <LanguagesDropdown onSelectChange={onSelectChange} />
        </div>

        <div >
           <button
              onClick={handleCompile}
              disabled={processing}
              className={processing ? "bg-red-300 z-10 px-4 py-2  text-white flex-shrink-0" :"bg-gray-700 z-10 px-4 py-2  text-white flex-shrink-0"}>
              {processing ? "Processing..." : "Run"}
            </button>
        </div>

        
        
      </div>

      <div className="flex flex-row  px-1 " >
        <div className="flex flex-col w-full h-full justify-start ">
          <CodeEditor
            code={code}
            onChange={onChange}
            language={language?.value}
          />
        </div>

        <div className="right-container flex flex-shrink-0 w-[30%] h-[100%] bg-pink-500 flex-col">
          <div className="flex flex-col items-end h-[40rem]">

          <OutputWindow outputDetails={outputDetails} />
          </div>

          <div className="flex flex-col items-end h-[12rem]">
            <CustomInput
              customInput={customInput}
              setCustomInput={setCustomInput}
            />

          </div>
        
        </div>
      </div>
    </div>
  )
}

export default App
