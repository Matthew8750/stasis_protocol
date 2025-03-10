To connect to database use following code:

PS: this can probably be optimized a lot

----------------------------------------------------------------



                let hostname = 'localhost';
                let username = 'jrice27';
                let password = 'rZk8FVrXNllcPl8Y';
                let database = 'CSC1034_CW_13';

                // Create the query string, what you are asking the database to do
                let query = `INSERT INTO player (player_name) VALUES ('${input}')`;

                // Prepare form data to send to the backend
                let formData = new FormData();
                formData.append('hostname', hostname);
                formData.append('username', username);
                formData.append('password', password);
                formData.append('database', database);
                formData.append('query', query);

                try {
                    let url = 'https://jrice27.webhosting1.eeecs.qub.ac.uk/dbConnector.php';
                    let response = await fetch(url, {
                        method: 'POST',
                        body: formData // Send the form data directly
                    });

                    let result = await response.json();

                    // Get the results div and clear previous results
                    let resultsDiv = document.getElementById('results');
                    resultsDiv.innerHTML = '';

                    if (result.error) {
                        console.log(result.error.toString());
                        resultsDiv.innerHTML = `<p style="color:red;">${result.error}</p>`;
                    } else {
                        resultsDiv.innerHTML = `<p>${result.success ? 'Query executed successfully' : 'No data returned'}</p>`;
                        if (result.affected_rows !== undefined) {
                            resultsDiv.innerHTML += `<p>Affected Rows: ${result.affected_rows}</p>`;
                        }
                    }
                } catch (error) {
                    console.error('Error:', error);
                    let resultsDiv = document.getElementById('results');
                    resultsDiv.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
            }
            