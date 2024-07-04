import { Component, OnInit } from '@angular/core';
import { PdfViewerModule, LinkAnnotationService, BookmarkViewService,
         MagnificationService, ThumbnailViewService, ToolbarService,
         NavigationService, TextSearchService, TextSelectionService,
         PrintService, FormDesignerService, FormFieldsService, 
         AnnotationService, PageOrganizerService, CustomToolbarItemModel } from '@syncfusion/ej2-angular-pdfviewer';
import { BlockBlobClient } from "@azure/storage-blob";

@Component({
  selector: 'app-root',
  // specifies the template string for the PDF Viewer component
  template: `<div class="content-wrapper">
                <ejs-pdfviewer id="pdfViewer"
                    [resourceUrl]='resource' 
                    [toolbarSettings]="toolbarSettings"
                    (toolbarClick)="toolbarClick($event)"
                    (created)='LoadPdfFromBlob()'
                    style="height:640px;display:block">
                </ejs-pdfviewer>
             </div>`,
  providers: [ LinkAnnotationService, BookmarkViewService, MagnificationService,
               ThumbnailViewService, ToolbarService, NavigationService,
               TextSearchService, TextSelectionService, PrintService,
               AnnotationService, FormDesignerService, FormFieldsService, PageOrganizerService]
})
export class AppComponent implements OnInit {
  public resource: string = "https://cdn.syncfusion.com/ej2/23.1.43/dist/ej2-pdfviewer-lib";

  public toolItem1: CustomToolbarItemModel = {
    prefixIcon: 'e-icons e-pv-download-document-icon',
    id: 'download_pdf',
    tooltipText: 'Download file',
    align: 'right'
  };

  public toolbarSettings = {
    showTooltip: true,
    toolbarItems: ['OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'SelectionTool', 'SearchOption', 'PrintOption', this.toolItem1, 'UndoRedoTool', 'AnnotationEditTool', 'FormDesignerEditTool', 'CommentTool', 'SubmitForm']
  };

  public toolbarClick(args: any): void {
    if (args.item && args.item.id === 'download_pdf') {
      this.SavePdfToBlob();
    }
  }

  ngOnInit(): void {
  }

  private accountName: string = "openpdfazure";
  private containerName: string = "fileupload";
  private blobName: string = "PDF_Succinctly.pdf";
  private SASUrl: string = "https://openpdfazure.blob.core.windows.net/fileupload/PDF_Succinctly.pdf?sp=racwdyti&st=2024-07-04T05:44:04Z&se=2024-07-11T13:44:04Z&spr=https&sv=2022-11-02&sr=b&sig=b0nGmZcXFBEJRHGmgUfcoxTLtuw8CIlCGgPjuDTQj3Y%3D";

  LoadPdfFromBlob() {
    const url = 'https://'+this.accountName+'.blob.core.windows.net/'+this.containerName+'/'+this.blobName;
    this.fetchAndConvertToBase64(url).then(base64String => {
      if (base64String) {
          var viewer = (<any>document.getElementById("pdfViewer")).ej2_instances[0];  
          setTimeout(() => {
            viewer.load("data:application/pdf;base64,"+base64String);
          }, 2000);
      } else {
          console.error('Failed to fetch and convert file to base64.');
      }
    }).catch(error => console.error('Error:', error));
  }

  async fetchAndConvertToBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const base64String = await this.blobToBase64(blob);
      return base64String;
    } catch (error) {
      console.error('Error fetching file:', error);
      return null;
    }
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
          const base64String = reader.result?.toString().split(',')[1] || '';
          resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(blob);
    });
  }

  SavePdfToBlob() {
    var proxy = this;
    var pdfViewer = (<any>document.getElementById('pdfViewer')).ej2_instances[0];
    pdfViewer.saveAsBlob().then(function (value: Blob) {
      var reader = new FileReader();
      reader.onload = async () => {
        // Convert ArrayBuffer to Uint8Array
        if (reader.result) {
          const arrayBuffer = reader.result as ArrayBuffer;
          const blobClient = new BlockBlobClient(proxy.SASUrl);
          // Upload data to the blob
          const uploadBlobResponse = await blobClient.upload(arrayBuffer, arrayBuffer.byteLength);
          console.log(`Upload blob successfully`, uploadBlobResponse.requestId);
        }
      };
      reader.readAsArrayBuffer(value);
    });
  }
}