let currentTab = 0;

function showTab(n) {
    const tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove("active");
    tabs[n].classList.add("active");
}

function nextPrev(n) {
    if (n === 1 && !validateForm()) return;
    currentTab += n;
    if (currentTab >= document.getElementsByClassName("tab").length) return;
    showTab(currentTab);
}

function validateForm() {
    const inputs = document.getElementsByClassName("tab")[currentTab].getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === "") {
            alert("All fields must be filled out");
            return false;
        }
    }
    return true;
}
function showHelp(fieldId) {
    const helpText = document.getElementById(`${fieldId}_help`);
    helpText.style.display = "block";
}

function hideHelp(fieldId) {
    const helpText = document.getElementById(`${fieldId}_help`);
    helpText.style.display = "none";
}
function updateRejectedDisplay(value) {
    document.getElementById('rejected_claims_display').value = `${value}%`;
    // Optionally, update the hidden input if you use one (not needed here since the range input is the form field)
}
function submitForm() {
    if (!validateForm()) return;

    const formData = {
        claims_per_month: Number(document.getElementById("claims_per_month").value),
        avg_reimbursement: Number(document.getElementById("avg_reimbursement").value),
        rejected_claims: Number(document.getElementById("rejected_claims").value),
        balance_0_30: Number(document.getElementById("balance_0_30").value),
        balance_31_60: Number(document.getElementById("balance_31_60").value),
        balance_61_90: Number(document.getElementById("balance_61_90").value),
        balance_91_120: Number(document.getElementById("balance_91_120").value),
        balance_over_120: Number(document.getElementById("balance_over_120").value),
        lrraname: document.getElementById("lrraname").value,
        lrraphone: document.getElementById("lrraphone").value,
        lrraemail: document.getElementById("lrraemail").value,
        patients_per_month: Number(document.getElementById("patients_per_month").value),
        days_to_reimbursement: Number(document.getElementById("days_to_reimbursement").value),
        days_to_submission: Number(document.getElementById("days_to_submission").value)
    };

    // Calculations
    const totalRevenue = formData.claims_per_month * formData.avg_reimbursement;
    const rejectedClaimsCount = (formData.rejected_claims / 100) * formData.claims_per_month;
    const lostRevenue = rejectedClaimsCount * formData.avg_reimbursement;
    const acceptedClaimsCount = formData.claims_per_month - rejectedClaimsCount;
    const totalBalance = formData.balance_0_30 + formData.balance_31_60 + formData.balance_61_90 + 
                        formData.balance_91_120 + formData.balance_over_120;
    
    const arAging = [
        (formData.balance_0_30 / totalBalance) * 100,
        (formData.balance_31_60 / totalBalance) * 100,
        (formData.balance_61_90 / totalBalance) * 100,
        (formData.balance_91_120 / totalBalance) * 100,
        (formData.balance_over_120 / totalBalance) * 100
    ];

    // Dynamic velocities and money lost
    const reimbursementVelocity = formData.days_to_reimbursement;
    const chargesVelocity = formData.days_to_submission;
    const moneyLost = lostRevenue; // Money lost is tied to rejected claims
    const avgPatientsPerDay = (formData.patients_per_month / 30).toFixed(0);

    // Hide form, show report
    document.getElementById("regForm").style.display = "none";
    const report = document.getElementById("report-container");
    report.style.display = "block";

    // Populate report
    document.getElementById("lrraname_value").textContent = formData.lrraname;
    document.getElementById("lrraphone_value").textContent = formData.lrraphone;
    document.getElementById("lrraemail_value").textContent = formData.lrraemail;
    document.getElementById("patients_per_month_value").textContent = formData.patients_per_month;
    document.getElementById("avg_patients_per_day").textContent = avgPatientsPerDay;
    document.getElementById("money_lost").textContent = moneyLost.toFixed(2);
    document.getElementById("reimbursement_velocity").textContent = reimbursementVelocity;
    document.getElementById("charges_velocity").textContent = chargesVelocity;
    document.getElementById("monthly_rejection_value").textContent = lostRevenue.toFixed(2);

    // Update AR aging table
    const mgmaBenchmarks = [25.7, 15.6, 8.9, 4.7, 3.1];
    for (let i = 0; i < arAging.length; i++) {
        const key = i === 0 ? "0_30" : i === 1 ? "31_60" : i === 2 ? "61_90" : i === 3 ? "91_120" : "over_120";
        document.getElementById(`ar_${key}`).textContent = `${arAging[i].toFixed(1)}%`;
        const diff = arAging[i] - mgmaBenchmarks[i];
        document.getElementById(`diff_${key}`).textContent = `${diff.toFixed(1)}%`;
    }

    // Generate charts
    generateCharts(rejectedClaimsCount, acceptedClaimsCount, arAging);
}

function generateCharts(rejectedClaims, acceptedClaims, arAging) {
    const rejectionRate = (rejectedClaims / (rejectedClaims + acceptedClaims)) * 100;

    // Claim Rejection Chart (unchanged, included for completeness)
    new Chart(document.getElementById("claimRejectionChart"), {
        type: "bar",
        data: {
            labels: ["Your Practice", "Industry Benchmark"],
            datasets: [{
                label: "Claim Rejection Rate (%)",
                data: [rejectionRate, 1.5],
                backgroundColor: ["#FF6384", "#36A2EB"],
                barThickness: 30
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: "Claim Rejection Comparison" },
                tooltip: { callbacks: { label: ctx => `${ctx.raw.toFixed(1)}%` } }
            },
            scales: { x: { beginAtZero: true, max: 100, title: { display: true, text: "Percentage" } } }
        }
    });

    // AR Benchmarking Chart (updated to fix overlapping, add gaps, and include all aging periods)
    new Chart(document.getElementById("arBenchmarkChart"), {
        type: "bar",
        data: {
            labels: ["0-30 Days", "31-60 Days", "61-90 Days", "91-120 Days", ">120 Days"], // Ensure all labels are included
            datasets: [
                {
                    label: "Your AR Aging (%)",
                    data: arAging, // Ensure this matches the 5 values for all periods
                    backgroundColor: "#FFCE56",
                    barThickness: 20, // Reduced thickness to prevent overlap
                    order: 2 // Ensure this dataset renders on top
                },
                {
                    label: "MGMA Benchmark (%)",
                    data: [25.7, 15.6, 8.9, 4.7, 3.1], // Ensure all 5 MGMA values are included
                    backgroundColor: "#4BC0C0",
                    barThickness: 20, // Consistent thickness
                    order: 1 // Ensure this renders first (underneath)
                }
            ]
        },
        options: {
            indexAxis: "y", // Horizontal bars
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: "AR Aging Comparison" },
                tooltip: { callbacks: { label: ctx => `${ctx.raw.toFixed(1)}%` } }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: "Percentage" },
                    ticks: { stepSize: 10 } // Clear increments for readability
                },
                y: {
                    barPercentage: 0.5, // Further reduce bar width for more space
                    categoryPercentage: 0.7, // Adjust category width for better gaps
                    offset: true // Add padding at the edges of categories
                }
            },
            barThickness: 20, // Explicitly set for all bars
            categorySpacing: 40, // Increased spacing between categories for clearer gaps
            barSpacing: 15, // Increased spacing between bars within the same category
            layout: {
                padding: { top: 30, bottom: 30, left: 20, right: 20 } // Add more padding to prevent bars from extending beyond the chart
            }
        }
    });
}