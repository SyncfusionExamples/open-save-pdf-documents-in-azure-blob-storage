<template>
  <ejs-pdfviewer 
    id="pdfViewer" 
    :resourceUrl="resourceUrl" 
    :toolbarClick="toolbarClick" 
    :created="loadPdfDocument" 
    :toolbarSettings="toolbarSettings">
  </ejs-pdfviewer>
</template>

<script>
import { PdfViewerComponent, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, 
           ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormDesigner, FormFields, PageOrganizer } from '@syncfusion/ej2-vue-pdfviewer';
import { BlockBlobClient } from "@azure/storage-blob";

  export default {
    name: 'App',

    components: {
      "ejs-pdfviewer": PdfViewerComponent
    },

    data() {
      let toolItem1 = {
        prefixIcon: 'e-icons e-pv-download-document-icon',
        id: 'download_pdf',
        tooltipText: 'Download file',
        align: 'right'
      };

      return {
        resourceUrl: 'https://cdn.syncfusion.com/ej2/23.1.43/dist/ej2-pdfviewer-lib',
        toolbarSettings: {
          toolbarItems: [ 'OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'SelectionTool', 'SearchOption', 'PrintOption', toolItem1, 'UndoRedoTool', 'AnnotationEditTool', 'FormDesignerEditTool', 'CommentTool', 'SubmitForm']
        },
      };
    },

    methods: {
      toolbarClick: function (args) {
          if (args.item && args.item.id === 'download_pdf') {
            this.savePdfDocument();
          }
      },

      loadPdfDocument: async function () {
        var SASUrl = "*Your SAS Url in Azure*";
        const response = await fetch(SASUrl);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = btoa(
          String.fromCharCode(...uint8Array)
        );
        var viewer = document.getElementById('pdfViewer').ej2_instances[0];
        setTimeout(function() {
          viewer.load("data:application/pdf;base64," + base64String);
        }, 2000);
      },

      savePdfDocument: function () {
        var viewer = document.getElementById('pdfViewer').ej2_instances[0];
        viewer.saveAsBlob().then(function (value) {
          var reader = new FileReader();
          reader.onload = async () => {
            if (reader.result) {
              var SASUrl = "*Your SAS Url in Azure*";
              const arrayBuffer = reader.result;
              const blobClient = new BlockBlobClient(SASUrl);
              const uploadBlobResponse = await blobClient.upload(arrayBuffer, arrayBuffer.byteLength);
              console.log(`Upload blob successfully`, uploadBlobResponse.requestId);
            }
          };
          reader.readAsArrayBuffer(value);
        });
      }
    },

    provide: {
      PdfViewer: [ Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView,
                   Print, TextSelection, TextSearch, Annotation, FormDesigner, FormFields, PageOrganizer ]
    }
  }
</script>

<style>
  @import '../node_modules/@syncfusion/ej2-base/styles/material.css';
  @import '../node_modules/@syncfusion/ej2-buttons/styles/material.css';
  @import '../node_modules/@syncfusion/ej2-dropdowns/styles/material.css';  
  @import '../node_modules/@syncfusion/ej2-inputs/styles/material.css';  
  @import '../node_modules/@syncfusion/ej2-navigations/styles/material.css';
  @import '../node_modules/@syncfusion/ej2-popups/styles/material.css';
  @import '../node_modules/@syncfusion/ej2-splitbuttons/styles/material.css';
  @import '../node_modules/@syncfusion/ej2-lists/styles/material.css';
  @import '../node_modules/@syncfusion/ej2-vue-pdfviewer/styles/material.css';
</style>