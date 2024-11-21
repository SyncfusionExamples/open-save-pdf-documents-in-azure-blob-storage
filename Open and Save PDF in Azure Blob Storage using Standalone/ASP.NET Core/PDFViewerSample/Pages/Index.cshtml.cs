using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;

namespace PDFViewerSample.Pages
{
    [IgnoreAntiforgeryToken(Order = 1001)]
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }

        private readonly string ConnectionString = "Your Connection string from Azure";
        private readonly string blobContainerName = "Your container name in Azure";
        public class UploadFileRequest
        {
            public string FileName { get; set; }
            public string FileContent { get; set; }
        }

        public async Task<IActionResult> OnPostUploadAsync([FromBody] UploadFileRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.FileName) || string.IsNullOrEmpty(request.FileContent))
            {
                return new JsonResult(new { error = "Invalid file or file name." }) { StatusCode = 400 };
            }

            try
            {
                byte[] fileBytes = Convert.FromBase64String(request.FileContent);
                BlobServiceClient blobServiceClient = new BlobServiceClient(ConnectionString);
                BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(blobContainerName);
                BlobClient blobClient = containerClient.GetBlobClient(request.FileName);

                using (var stream = new MemoryStream(fileBytes))
                {
                    await blobClient.UploadAsync(stream, true);
                }

                var fileUrl =  blobClient.Uri.ToString();
                return new JsonResult(fileUrl);
            }
            catch (Exception ex)
            {
                return new JsonResult(new { error = ex.Message }) { StatusCode = 500 };
            }
        }
    }
}