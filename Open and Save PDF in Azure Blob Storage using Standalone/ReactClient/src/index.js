import * as ReactDOM from 'react-dom';
import * as React from 'react';
import './index.css';
import { PdfViewerComponent, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
         ThumbnailView, Print, TextSelection, Annotation, TextSearch, FormFields, FormDesigner, Inject} from '@syncfusion/ej2-react-pdfviewer';
import { BlockBlobClient } from "@azure/storage-blob";

function App() {
  let viewer;
  let accountName = "*Your account name in Azure*";
  let containerName = "*Your container name in Azure*";
  let blobName = "*Your Blob name in Azure*";
  let SASUrl = "*Your SAS Url in Azure*";
  
  var toolItem1 = {
    prefixIcon: 'e-icons e-pv-download-document-icon',
    id: 'download_pdf',
    tooltipText: 'Download file',
    align: 'right'
  };

  function toolbarClick(args){
    if (args.item && args.item.id === 'download_pdf') {
      saveDocument();
    }
  };

  function loadDocument() {
    var url = 'https://' + accountName + '.blob.core.windows.net/' + containerName + '/' + blobName;
    fetchAndConvertToBase64(url).then(function(base64String) {
      if (base64String) {
        setTimeout(function() {
          viewer.load("data:application/pdf;base64," + base64String);
        }, 2000);
      } else {
        console.error('Failed to fetch and convert file to base64.');
      }
    }).catch(function(error) {
      console.error('Error:', error);
    });
  }

  function fetchAndConvertToBase64(url) {
    return new Promise(function(resolve, reject) {
      fetch(url).then(function(response) {
        if (!response.ok) {
          throw new Error('HTTP error! Status: ' + response.status);
        }
        return response.blob();
      }).then(function(blob) {
        blobToBase64(blob).then(function(base64String) {
          resolve(base64String);
        });
      }).catch(function(error) {
        console.error('Error fetching file:', error);
        reject(null);
      });
    });
  }

  function blobToBase64(blob) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() {
        var base64String = reader.result ? reader.result.toString().split(',')[1] : '';
        resolve(base64String);
      };
      reader.onerror = function(error) {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  }

  function saveDocument() {
    viewer.saveAsBlob().then(function (value) {
      var reader = new FileReader();
      reader.onload = async () => {
        if (reader.result) {
          const arrayBuffer = reader.result;
          const blobClient = new BlockBlobClient(SASUrl);
          // Upload data to the blob
          const uploadBlobResponse = await blobClient.upload(arrayBuffer, arrayBuffer.byteLength);
          console.log(`Upload blob successfully`, uploadBlobResponse.requestId);
        }
      };
      reader.readAsArrayBuffer(value);
    });
  };
    return (<div>
    <div className='control-section'>
    {/* Render the PDF Viewer */}
    <PdfViewerComponent
        ref={(scope) => {
          viewer = scope;
        }}
        created={loadDocument}
        id="container"
        resourceUrl="https://cdn.syncfusion.com/ej2/23.1.40/dist/ej2-pdfviewer-lib"
        style={{ 'height': '640px' }}
        toolbarSettings={{ showTooltip : true, toolbarItems: [ 'OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'SelectionTool', 'SearchOption', 'PrintOption', toolItem1, 'UndoRedoTool', 'AnnotationEditTool', 'FormDesignerEditTool', 'CommentTool', 'SubmitForm']}}
        toolbarClick={toolbarClick}
      >  
      <Inject services={[ Toolbar, Magnification, Navigation, Annotation, LinkAnnotation, BookmarkView,
                          ThumbnailView, Print, TextSelection, TextSearch, FormFields, FormDesigner ]}/>

      </PdfViewerComponent>
    </div>
  </div>);
}
const root = ReactDOM.createRoot(document.getElementById('sample'));
root.render(<App />);