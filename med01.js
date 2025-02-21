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
                patients_per_month: Number(document.getElementById("patients_per_month").value)
            };

            // Calculations
            const totalRevenue = formData.claims_per_month * formData.avg_reimbursement;
            const rejectedClaimsCount = (formData.rejected_claims / 100) * formData.claims_per_month;
            const lostRevenue = rejectedClaimsCount * formData.avg_reimbursement;
            const acceptedClaimsCount = formData.claims_per_month - rejectedClaimsCount;
            
            const totalBalance = formData.balance_0_30 + formData.balance_31_60 + formData.balance_61_90 + formData.balance_91_120 + formData.balance_over_120;
            const arAging = [
                (formData.balance_0_30 / totalBalance) * 100,
                (formData.balance_31_60 / totalBalance) * 100,
                (formData.balance_61_90 / totalBalance) * 100,
                (formData.balance_91_120 / totalBalance) * 100,
                (formData.balance_over_120 / totalBalance) * 100
            ];

            // Reimbursement and Charges Velocities (placeholders, adjust based on data)
            const reimbursementVelocity = 121; // Example from PDF
            const chargesVelocity = -180; // Example from PDF
            const moneyLost = -17370; // Example from PDF
            const avgPatientsPerDay = (formData.patients_per_month / 30).toFixed(0); // Assuming 30 days/month

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
            document.getElementById("ar_0_30").textContent = `${arAging[0].toFixed(1)}%`;
            document.getElementById("ar_31_60").textContent = `${arAging[1].toFixed(1)}%`;
            document.getElementById("ar_61_90").textContent = `${arAging[2].toFixed(1)}%`;
            document.getElementById("ar_91_120").textContent = `${arAging[3].toFixed(1)}%`;
            document.getElementById("ar_over_120").textContent = `${arAging[4].toFixed(1)}%`;

            // Calculate differences from MGMA benchmarks
            const mgmaBenchmarks = [25.7, 15.6, 8.9, 4.7, 3.1];
            for (let i = 0; i < arAging.length; i++) {
                const diff = arAging[i] - mgmaBenchmarks[i];
                document.getElementById(`diff_${i === 0 ? '0_30' : i === 1 ? '31_60' : i === 2 ? '61_90' : i === 3 ? '91_120' : 'over_120'}`).textContent = `${diff.toFixed(1)}%`;
            }

            // Generate charts
            generateCharts(rejectedClaimsCount, acceptedClaimsCount, arAging);
        }

        function generateCharts(rejectedClaims, acceptedClaims, arAging) {
            // Claim Rejection Horizontal Bar Chart
            new Chart(document.getElementById("claimRejectionChart"), {
                type: "bar",
                data: {
                    labels: ["Your Practice", "Industry Benchmark"],
                    datasets: [{
                        label: "Claim Rejection Rate (%)",
                        data: [rejectedClaims / (rejectedClaims + acceptedClaims) * 100, 1.5], // Example benchmark
                        backgroundColor: ["#FF6384", "#36A2EB"],
                        barThickness: 20
                    }]
                },
                options: {
                    indexAxis: 'y', // Horizontal bars
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { title: { display: true, text: "Monthly Claim Rejection Report" } },
                    scales: { x: { beginAtZero: true, max: 100 } }
                }
            });

            // AR Benchmarking Horizontal Bar Chart
            new Chart(document.getElementById("arBenchmarkChart"), {
                type: "bar",
                data: {
                    labels: ["0-30 Days", "31-60 Days", "61-90 Days", "91-120 Days", ">120 Days"],
                    datasets: [{
                        label: "Your AR Aging (%)",
                        data: arAging,
                        backgroundColor: "#FFCE56",
                        barThickness: 20
                    }, {
                        label: "MGMA Benchmark (%)",
                        data: [25.7, 15.6, 8.9, 4.7, 3.1],
                        backgroundColor: "#4BC0C0",
                        barThickness: 20
                    }]
                },
                options: {
                    indexAxis: 'y', // Horizontal bars
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { title: { display: true, text: "MGMA AR Benchmarking" } },
                    scales: { x: { beginAtZero: true, max: 100 } }
                }
            });
        }