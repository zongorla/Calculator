using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using Calculator.Services;

namespace Calculator.Controllers
{

    public class Number
    {
        public double Value { get; set; }
    }

    [ApiController]
    [Route("[controller]/{id?}")]
    public class MemoryController : ControllerBase
    {
        private readonly ILogger<MemoryController> _logger;
        private readonly INumberStorage _numberStorage;

        public MemoryController(ILogger<MemoryController> logger, INumberStorage numberStorage)
        {
            _logger = logger;
            _numberStorage = numberStorage;
        }

        [HttpGet]
        public double Get(Guid id)
        {
            return _numberStorage.Read(id);
        }

        [HttpPost]
        public Guid Post(Number data)
        {
            return _numberStorage.Create(data.Value);
        }

        [HttpPut]
        public void Put(Guid id, [FromBody]Number data)
        {
            _numberStorage.Update(id, data.Value);
        }
    }
}
