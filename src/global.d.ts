interface DatabaseTyping{
    "[DEFAULT]": {
        "myTable": {
            "name": string | null | undefined; 
            "createdAt": Date | null | undefined; 
            "gender": "Female" | "Male" | "Other" | null | undefined; 
            "amount": number;
        }
    }
}