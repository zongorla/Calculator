
export class MemoryService {

    save(newValue: number): Promise<any> {
        let self = this;
        if (self.id)
            return fetch("memory/" + self.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: newValue }),
            });
        else {
            return fetch("memory/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: newValue }),
            }).then(function (response): Promise<Response> {
                response.text().then(id => self.id = id)
                return response.json();
            });
        }
    }

    load(): Promise<number> {
        return fetch("memory/" + this.id).then(response => response.json() as Promise<number>)
    }

    get id(): string | null {
        let storedId = localStorage.getItem("memoryId");
        if (storedId) {
            storedId = JSON.parse(storedId);
        }
        return storedId;
    }

    set id(value: string | null) {
        if(value !== null)
            localStorage.setItem("memoryId", value);
    }

}