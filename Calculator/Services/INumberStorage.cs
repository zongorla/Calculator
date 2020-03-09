using System;

namespace Calculator.Services
{
    public interface INumberStorage
    {
        Guid Create(double number);

        void Update(Guid id, double number);

        double Read(Guid id);
    }
}
