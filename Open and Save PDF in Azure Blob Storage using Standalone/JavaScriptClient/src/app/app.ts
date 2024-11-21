import { PdfViewer, CustomToolbarItemModel, Toolbar, Magnification, Navigation, Annotation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, FormFields, FormDesigner} from '@syncfusion/ej2-pdfviewer';
import { BlockBlobClient } from "@azure/storage-blob";

PdfViewer.Inject(Toolbar, Magnification, Navigation, Annotation, LinkAnnotation, ThumbnailView, BookmarkView, TextSelection, TextSearch, FormFields, FormDesigner);

let pdfviewer: PdfViewer = new PdfViewer();
pdfviewer.resourceUrl = "https://cdn.syncfusion.com/ej2/23.1.43/dist/ej2-pdfviewer-lib";

let accountName: string = "*Your account name in Azure*";
let containerName: string = "*Your container name in Azure*";
let blobName: string = "*Your Blob name in Azure*";
let SASUrl: string = "*Your SAS Url in Azure*";
  
let toolItem1: CustomToolbarItemModel = {
    prefixIcon: 'e-icons e-pv-download-document-icon',
    id: 'download_pdf',
    tooltipText: 'Download file',
    align: 'right'
};

pdfviewer.toolbarSettings = { toolbarItems: [ 'OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'SelectionTool', 'SearchOption', 'PrintOption', toolItem1, 'UndoRedoTool', 'AnnotationEditTool', 'FormDesignerEditTool', 'CommentTool', 'SubmitForm']}

pdfviewer.toolbarClick = function (args) {
    if (args.item && args.item.id === 'download_pdf') {
        saveDocument();
    }
};

function saveDocument() {
    pdfviewer.saveAsBlob().then(function (value) {
      var reader = new FileReader();
      reader.onload = async () => {
        if (reader.result) {
          const arrayBuffer: any = reader.result;
          const blobClient = new BlockBlobClient(SASUrl);
          const uploadBlobResponse = await blobClient.upload(arrayBuffer, arrayBuffer.byteLength);
          console.log(`Upload blob successfully`, uploadBlobResponse.requestId);
        }
      };
      reader.readAsArrayBuffer(value);
    });
};

pdfviewer.created = function () {
    const url = 'https://'+accountName+'.blob.core.windows.net/'+containerName+'/'+blobName;
    fetchAndConvertToBase64(url).then(base64String => {
      if (base64String) { 
          setTimeout(() => {
            pdfviewer.load("data:application/pdf;base64,"+base64String, "");
          }, 2000);
      } else {
          console.error('Failed to fetch and convert file to base64.');
      }
    }).catch(error => console.error('Error:', error));
}

function fetchAndConvertToBase64(url : any) {
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

function blobToBase64(blob : any) {
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

pdfviewer.appendTo('#PdfViewer');