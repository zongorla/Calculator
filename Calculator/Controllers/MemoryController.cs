using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace Calculator.Controllers
{

    public class Number
    {
        public double Value { get; set; }
    }

    [ApiController]
    [Route("[controller]")]
    public class MemoryController : ControllerBase
    {
        private readonly ILogger<MemoryController> _logger;

        public MemoryController(ILogger<MemoryController> logger)
        {
            _logger = logger;
        }

        private static double number = 0;


        [HttpGet]
        public double Get()
        {
            return MemoryController.number;
        }

        [HttpPost]
        public void Post(Number data)
        {
            double number = data.Value;
            MemoryController.number = number;
        }
    }
}
