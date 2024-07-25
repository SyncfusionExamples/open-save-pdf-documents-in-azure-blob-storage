using Azure.Storage.Blobs;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Policy;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.UI.WebControls;

namespace PDFViewerSample.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        private readonly string ConnectionString = "Your Connection string from Azure";
        private readonly string blobContainerName = "Your container name in Azure";

        [HttpPost]
        public async Task<ActionResult> Upload(UploadFileRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.FileName) || string.IsNullOrEmpty(request.FileContent))
            {
                return Json(new { error = "Invalid file or file name." });
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

                var fileUrl = blobClient.Uri.ToString();
                return Json(new { fileUrl });
            }
            catch (Exception ex)
            {
                return Json(new { error = ex.Message });
            }
        }

        public class UploadFileRequest
        {
            public string FileName { get; set; }
            public string FileContent { get; set; }
        }
    }
}