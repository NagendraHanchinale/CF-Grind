document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let username = document.getElementById('username').value;
    fetchUserRating(username);
});

async function fetchUserRating(username) {
    const userRatingUrl = `https://codeforces.com/api/user.info?handles=${username}`;
    
    try {
        const response = await fetch(userRatingUrl);
        const data = await response.json();
        
        if (data.status === "OK") {
            const rating = data.result[0].rating;
            document.getElementById('userRating').innerHTML = `<h2>User Rating: ${rating}</h2>`;
            fetchSolvedProblems(username, rating);
        } else {
            document.getElementById('userRating').innerHTML = "User not found.";
        }
    } catch (error) {
        console.error('Error fetching user rating:', error);
    }
}

async function fetchSolvedProblems(username, rating) {
    const submissionsUrl = `https://codeforces.com/api/user.status?handle=${username}`;
    
    try {
        const response = await fetch(submissionsUrl);
        const data = await response.json();

        if (data.status === "OK") {
            const solvedProblems = new Set();  // Use a Set to avoid duplicates

            data.result.forEach(submission => {
                if (submission.verdict === "OK") {
                    // Store problems in the Set
                    solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
                }
            });

            document.getElementById('solvedProblemsCount').innerHTML = `<h2>Problems Solved: ${solvedProblems.size}</h2>`;
            fetchProblemsBasedOnRating(rating, solvedProblems);
        } else {
            console.error('Error fetching submissions:', data);
        }
    } catch (error) {
        console.error('Error fetching submissions:', error);
    }
}

async function fetchProblemsBasedOnRating(rating, solvedProblems) {
    const problemSetUrl = `https://codeforces.com/api/problemset.problems`;

    try {
        const response = await fetch(problemSetUrl);
        const data = await response.json();

        if (data.status === "OK") {
            const problems = data.result.problems.filter(problem => {
                return problem.rating >= rating - 100 && problem.rating <= rating + 200;
            });
            displayProblems(problems, solvedProblems);
        } else {
            console.error('Error fetching problems:', data);
        }
    } catch (error) {
        console.error('Error fetching problems:', error);
    }
}

function displayProblems(problems, solvedProblems) {
    let problemContainer = document.getElementById('problemContainer');
    problemContainer.innerHTML = "";  // Clear previous content

    if (problems.length === 0) {
        problemContainer.innerHTML = "<p>No problems found within the specified rating range.</p>";
        return;
    }

    problems.forEach(problem => {
        let problemDiv = document.createElement('div');
        problemDiv.classList.add('problem');
        
        // Check if the problem is solved
        const problemKey = `${problem.contestId}-${problem.index}`;
        const isSolved = solvedProblems.has(problemKey);

        // Get tags associated with the problem
        let tags = problem.tags.length > 0 ? problem.tags.join(", ") : "No tags";

        problemDiv.innerHTML = `
            <a href="https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}" target="_blank">
                ${problem.name} ${isSolved ? '(Solved)' : ''}
            </a>
            <p>Rating: ${problem.rating}</p>
            <p>Tags: ${tags}</p>
        `;
        
        problemContainer.appendChild(problemDiv);
    });
}
