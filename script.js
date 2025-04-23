$(document).ready(function() {
    // File reader setup
    function setupFileReader(inputId, textareaId) {
        $(`#${inputId}`).change(function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                if (file.name.endsWith('.html')) {
                    // Parse HTML file
                    const usernames = parseInstagramHTML(e.target.result);
                    $(`#${textareaId}`).val(usernames.join('\n'));
                } else {
                    // Regular text file
                    $(`#${textareaId}`).val(e.target.result);
                }
            };
            reader.onerror = function() {
                alert('Error reading file');
            };
            reader.readAsText(file);
        });
    }
    
    // Set up file readers
    setupFileReader('followers-file', 'followers');
    setupFileReader('following-file', 'following');
    
    $('#compare-btn').click(function() {
        // Get the text from both textareas
        let followersText = $('#followers').val().trim();
        let followingText = $('#following').val().trim();
        
        if (!followersText || !followingText) {
            alert('Please provide both your followers and following lists');
            return;
        }
        
        // Process the text to extract usernames
        const followers = extractUsernames(followersText);
        const following = extractUsernames(followingText);
        
        // Find who isn't following back
        const nonFollowers = following.filter(user => !followers.includes(user));
        
        // Display results
        displayResults(followers.length, following.length, nonFollowers);
    });
    
    function parseInstagramHTML(htmlContent) {
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Find all the links in the format instagram.com/username
        const links = doc.querySelectorAll('a[href^="https://www.instagram.com/"]');
        const usernames = [];
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            // Extract username from URL
            const username = href.split('https://www.instagram.com/')[1].split('/')[0];
            if (username && !usernames.includes(username)) {
                usernames.push(username);
            }
        });
        
        return usernames;
    }
    
    function extractUsernames(text) {
        if (!text) return [];
        
        // Split by new lines and filter out empty lines
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const usernames = [];
        
        lines.forEach(line => {
            // Remove any dates or other metadata that might be on the line
            const cleanLine = line.replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2},\s\d{4}.*/, '').trim();
            
            // Extract username (could be plain username, @username, or instagram.com/username)
            const usernameMatch = cleanLine.match(/(?:@|(?:https?:\/\/)?(?:www\.)?instagram\.com\/)?([a-zA-Z0-9._]+)/);
            if (usernameMatch && usernameMatch[1]) {
                const username = usernameMatch[1].toLowerCase();
                if (!usernames.includes(username)) {
                    usernames.push(username);
                }
            }
        });
        
        return usernames;
    }
    
    function displayResults(followerCount, followingCount, nonFollowers) {
        // Update counts
        $('#follower-count').text(followerCount);
        $('#following-count').text(followingCount);
        $('#non-followers-count').text(nonFollowers.length);
        $('#non-followers-count-2').text(nonFollowers.length);
        
        // Populate non-followers list
        const $nonFollowersList = $('#non-followers-list');
        $nonFollowersList.empty();
        
        if (nonFollowers.length === 0) {
            $nonFollowersList.append('<li>Everyone you follow follows you back!</li>');
        } else {
            nonFollowers.forEach(username => {
                $nonFollowersList.append(
                    $('<li>').append(
                        $('<a>')
                            .attr('href', `https://instagram.com/${username}`)
                            .attr('target', '_blank')
                            .text(username)
                    )
                );
            });
        }
        
        // Show results section
        $('#results').show();
        
        // Scroll to results
        $('html, body').animate({
            scrollTop: $('#results').offset().top - 20
        }, 500);
    }
});