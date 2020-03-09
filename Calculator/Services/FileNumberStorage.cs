using System;
using System.IO;

namespace Calculator.Services
{
    public class  FileNumberStorage : INumberStorage
    {
        string BaseFolder { get; }

        public FileNumberStorage(string baseFolder)
        {
            BaseFolder = baseFolder;
            if (!Directory.Exists(BaseFolder))
            {
                Directory.CreateDirectory(BaseFolder);
            }
        }

        public Guid Create(double number)
        {
            Guid id = Guid.NewGuid();
            File.WriteAllText(GetPath(id), FormatNumber(number));
            return id;
        }

        public void Update(Guid id,double number)
        {
            File.WriteAllText(GetPath(id), FormatNumber(number));
        }

        public double Read(Guid id)
        {
            string path = GetPath(id);
            if (File.Exists(path))
            {
                return ParseNumber(File.ReadAllText(path));
            }
            else
            {
                return 0;
            }
        }

        public string GetPath(Guid id)
        {
            return Path.Combine(BaseFolder, id.ToString());
        }

        public string FormatNumber(double number)
        {
            return number.ToString();
        }

        public double ParseNumber(string number)
        {
            return Double.Parse(number);
        }

    }
}
