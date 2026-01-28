# amy14rubio.github.io

## Reflection Questions

### 1. Share one technical concept that you developed greater mastery over in this project. Demonstrate how you understand that concept by sharing your mental model of the concept. Then, show how you used that concept in your project.

One technical concept I developed greater mastery over was the use of the `::before` pseudo-element in CSS. My mental model of this concept is that `::before` allows you to create a styled element that exists before the content of a target element without altering the element’s main structure. This is useful for creating decorative overlays, backgrounds, or layered effects while keeping the HTML clean and maintaining the element’s original layout.

In my project, I used `::before` to create wavy decorative overlays for different sections of the site. By applying the wave effect to the pseudo-element instead of the section itself, I was able to style it independently, ensuring the waves acted purely as visual enhancements without affecting the content or spacing of the sections.

### 2. Choose one project requirement that you found challenging and are proud of implementing. Describe what made it challenging and how you were able to implement the requirement by walking through your code as succinctly as possible. Remember that your audience does not know your code nearly as well as you do so you’ll have to break it down in a logical manner for them to quickly understand it.

One project requirement I found challenging was designing the hero section, which sets the theme and first impression for the website. I wanted the hero section to be visually engaging, so I decided to implement a cursor-responsive text-shadow effect for the title. This feature required combining CSS styling with precise JavaScript calculations.

I based my implementation on a CodePen example: [Animated Eyes Follower Cursor](https://codepen.io/teeange-programmer/pen/WNKvyNY). Instead of applying the effect to the entire window, I attached the event listener to the `home` section using `home.addEventListener('mousemove', …)`. This ensured the effect only triggers when the cursor is within the hero section, improving performance and focusing the interaction.

Next, I assigned the title element’s dimensions to `const rect` and calculated the center of the title. These center coordinates are used to determine the cursor’s relative position to the title, which in turn calculates `offsetX` and `offsetY` parameters, controlling how far each text-shadow moves in response to cursor movement. Dividing `(centerX - event.pageX)` by different numbers allows fine-tuning of the shadow’s tightness or looseness.

Finally, I styled the `text-shadow` property of the title element. The first shadow functions as a white highlight that moves opposite the cursor to simulate a light source. The remaining shadows are progressively darker greys with decreasing opacity, creating a layered, 3D effect. Each offset is rounded with `toFixed()` and multiplied to control spacing between shadow layers, producing a smooth, visually appealing response to cursor movement.

### 3. How did you leverage AI to assist your development of this project?

This project provided me an opportunity to build something with AI assistance. Check out my [AI Usage Document](https://docs.google.com/document/d/1nCg1vsm6g7sLwAA4lGUPGwLD-5Y2g_pe8AEdM1tnqEo/edit?usp=sharing) to see how I used AI on this project.
