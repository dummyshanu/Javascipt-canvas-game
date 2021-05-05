const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
const scoreID = document.querySelector("#scoreID")
const startGame = document.querySelector("#stratGameID")
const gameMenu = document.querySelector("#gameMenuID")
const currentScore = document.querySelector("#currentScoreID")
// console.log(gsap)
addEventListener("resize", function() {
	canvas.width = innerWidth;	
	canvas.height = innerHeight;
    player.draw()
});
const canvas2D=canvas.getContext("2d")


class Player{
    constructor(x,y,radius){
        this.x=x;
        this.y=y;
        this.radius=radius;
    }
    draw(){
        canvas2D.beginPath();
        canvas2D.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        canvas2D.fillStyle="#ffff"
        canvas2D.fill();
    }
}

const player = new Player(canvas.width/2,canvas.height/2, 10);


class Projectiles{
    constructor(x, y, radius, color, velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
    }
    draw(){
        canvas2D.beginPath();
        canvas2D.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        canvas2D.fillStyle=this.color;
        canvas2D.fill();
    }
    update(){
        this.draw()
        this.x+=this.velocity.x*5;
        this.y+=this.velocity.y*5;
    }
}


class Enimes{
    constructor(x, y, radius, color, velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
    }
    draw(){
        canvas2D.beginPath();
        canvas2D.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        canvas2D.fillStyle=this.color;
        canvas2D.fill();
    }
    update(){
        this.draw()
        this.x+=this.velocity.x;
        this.y+=this.velocity.y;
    }
}


const friction = .95
class Particle{
    constructor(x, y, radius, color, velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
        this.alpha=1;
    }
    draw(){
        canvas2D.save();
        canvas2D.globalAlpha=this.alpha
        canvas2D.beginPath();
        canvas2D.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        canvas2D.fillStyle=this.color;
        canvas2D.fill();
        canvas2D.restore()
    }
    update(){
        this.draw()
        this.velocity.x*=friction;
        this.velocity.y*=friction;
        this.x+=this.velocity.x;
        this.y+=this.velocity.y;
        this.alpha-=.01;
    }
}


const x = canvas.width/2;
const y = canvas.height/2;
let projectiles;
let enimes;
let particle;
let score;

function resetGame(){
    projectiles = []
    enimes = []
    particles= []
    score=0;

}


function spawnEnimes(){
    setInterval(()=>{
        let y;
        let x;
        const color = `hsl(${Math.random()*360},50%,50%)`;
        const radius = Math.random()*(30-4)+10;

        if (Math.random()<.5){
            x = Math.random() <.5 ? 0-radius: canvas.width+radius;
            y = Math.random() * canvas.height;
        }
        else{
            x = Math.random() * canvas.width;
            y = Math.random() <.5 ? 0-radius: canvas.height+radius;
            
        }

        const angle = Math.atan2((canvas.height/2)-y, (canvas.width/2)-x);
        const velocity = {
            x: Math.cos(angle),
            y:Math.sin(angle)
            }

        enimes.push(new Enimes(x, y, radius, color, velocity))
    }, 1000)
}
let animationId;

function animate(){
    animationId = requestAnimationFrame(animate);
    canvas2D.fillStyle="rgba(0,0,0,.1)"
    canvas2D.fillRect(0, 0, innerWidth, innerHeight);
    player.draw()

    particles.forEach((particle, praticle_idx)=>{

        if(particle.alpha<=0){
            particles.splice(praticle_idx,1)
        }else{
            particle.update();
        }
    })

    projectiles.forEach((projectile, id)=>{
        
        projectile.update();

        // console.log(projectiles.length);
        if( projectile.x+projectile.radius<0 ||
            projectile.x-projectile.radius> canvas.width ||
            projectile.y+projectile.radius<0 ||
            projectile.y-projectile.radius> canvas.height
            ){
            setTimeout(()=>{
                projectiles.splice(id, 1)
                // console.log("after removal", projectiles.length)
            }, 0)
        }


    });
    enimes.forEach((enime, enime_idx)=>{
        enime.update();

        const dist = Math.hypot(player.x-enime.x, player.y-enime.y)

            if (dist-enime.radius-player.radius<1){
                // console.log("game Over")
                cancelAnimationFrame(animationId)
                gameMenu.style.display="flex";
                currentScore.innerHTML = score;
            }


        projectiles.forEach((projectile, projectile_idx)=>{
            const dist = Math.hypot(projectile.x-enime.x, projectile.y-enime.y)

            if (dist-enime.radius-projectile.radius<1){
                // console.log("Boom")

                if(enime.radius-10>8){
                    setTimeout(()=>{

                        for (let i=0; i<enime.radius*2; i++){
                            particles.push(
                                new Particle(
                                    projectile.x, 
                                    projectile.y, 
                                    Math.random()*2, 
                                    enime.color, 
                                    {x:(Math.random()-.5)*(Math.random()*enime.radius), y:(Math.random()-.5)*(Math.random()*enime.radius)
                                    }) 
                                )
                        }

                        gsap.to(enime,{
                            radius:enime.radius-10
                        })

                        enime.radius-=10;
                        projectiles.splice(projectile_idx, 1)
                    }, 0)

                    score+=50;
                    scoreID.innerHTML=score;

                }else{
                    setTimeout(()=>{
                        enimes.splice(enime_idx, 1);
                        projectiles.splice(projectile_idx, 1)
                    }, 0)

                    score+=200;
                    scoreID.innerHTML=score;
                }
               
                
            }
        })

        

    })


}

addEventListener("click", (event)=>{
    const angle = Math.atan2(event.y-canvas.height/2, event.x-canvas.width/2);
    const velocity = {x: Math.cos(angle), y:Math.sin(angle)}
    projectiles.push(new Projectiles(x, y, 5, "#eee", velocity));
    

})


startGame.addEventListener("click", ()=>{
    console.log("ok")
    resetGame()
    gameMenu.style.display = "none"
    startGame.style.background="blue";
    currentScore.innerHTML = 0;
    scoreID.innerHTML = 0;
    spawnEnimes()
    animate()
})

function load(){
    startGame.disabled = true;
    startGame.style.background="red";
    setTimeout(()=>{
        startGame.disabled=false;
        startGame.style.background="blue";
    },3000);
}

load();




// spawnEnimes()
// animate()
