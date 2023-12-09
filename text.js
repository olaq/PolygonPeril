function displayText(ctx, text, x, y, color = 'white', fontSize = 20, align = 'center') {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

// function displayText(canvas, text, x, y, color = 'white', fontSize = 20, align = 'center') {
//     ctx = canvas.getContext('2d');
//     ctx.font = `${fontSize}px Arial`;
//     ctx.fillStyle = color;
//     ctx.textAlign = align;
//     ctx.fillText(text, x, y);
// }