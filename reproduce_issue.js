const fetch = require('node-fetch');

async function testCreate() {
    // Payload mimicking react-hook-form with undefined optional fields (JSON.stringify removes them)
    const payload = {
        name: "Test Minimal Payload " + Date.now(),
        priority: "Medium",
        // website, description, contacts missing
        profiles: [
            {
                subject: "Math",
                level: "-",
                // description missing
                stages: [
                    {
                        name: "Stage 1",
                        type: "Offline"
                        // startDate, endDate, regDeadline missing
                    }
                ]
            }
        ]
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('http://localhost:3001/api/olympiads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testCreate();
