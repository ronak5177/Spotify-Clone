let currentSong = new Audio()
let songs;
let currFolder;

function secondsToMinutes(seconds) {
  // Ensure seconds is a non-negative number
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
}

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format the time as "mm:ss"
    const formattedTime =
    (minutes < 10 ? '0' : '') + minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

  return formattedTime;
}

async function getSongs(folder) {
  currFolder = folder
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}`)[1]);
    }
  }
  // Show all the songs in the playlist
  let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUl.innerHTML = ""
  for (let song of songs){
    song = decodeURI(song);
    console.log(song)
    songUl.innerHTML += `<li><img class="invert" src="img/music.svg" alt="music.svg">
                <div class="info">
                <div>${song.replaceAll("%20"," ")}</div>
                <div>Ronak</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span> 
                  <img class="invert" src="img/play.svg" alt="play.svg">
                </div></li>`
  }
  
  // Attach an event listener to each songs
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click", ()=>{
      playMusic(e.querySelector(".info").firstElementChild.innerHTML)
    })
  })
  return songs;
}

const playMusic = (track, pause=false)=>{
  currentSong.src = `${currFolder}` + track
  if(!pause){    
    currentSong.play()
    play.src = "img/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00" 
}

async function displayAlbums(){
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let array = Array.from(anchors)
  for (let i = 0; i < array.length; i++) {
    const e = array[i];    
    if (e.href.includes("/songs") && (!e.href.includes(".htaccess"))){
      let folderData = e.href.split("/").slice(-2)[0]
      let cardContainer = document.querySelector(".cardContainer")
      let a = await fetch(`/songs/${folderData}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML += ` <div data-folder="${folderData}" class="card">
      <div class="play">
        <svg
          width="60"
          height="60"
          viewBox="-2 -2 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#1DB954"
            stroke-width="1.5"
            fill="#1DB954"
          />
          <path
            d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z"
            fill="black"
          />
        </svg>
      </div>
      <img
        src="/songs/${folderData}/cover.jpg"
        alt="Mix"
      />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`

    }
  }
  // })

}

async function main() {
  // Get list of all songs
  // document.querySelector(".songtime").innerHTML = "00:00 / 00:00" 
  await getSongs("songs/Anuv_Jain/");
  playMusic(songs[0], true)

  // Display all the albums on the page
  await displayAlbums() 

  // Attach an event listener to play
  play.addEventListener("click", ()=>{
    if(currentSong.paused){
      currentSong.play()
      play.src = "img/pause.svg"
    } else{
      currentSong.pause()
      play.src = "img/play.svg"
    }
  })

  // Listen for time update event
  currentSong.addEventListener("timeupdate", ()=>{
    // console.log(currentSong.currentTime, currentSong.duration)
    document.querySelector(".songtime").innerHTML =  `
    ${secondsToMinutes(currentSong.currentTime)}/
    ${secondsToMinutes(currentSong.duration)}`

    document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%"
    if (currentSong.currentTime === currentSong.duration){
      currentSong.pause()
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
      if ((index + 1) < songs.length) {
          playMusic(songs[index + 1])
      }
    }
  })

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e)=>{
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%"
    currentSong.currentTime = percent * (currentSong.duration) / 100
  })

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "0"
  })

   // Add an event listener for close
   document.querySelector(".close").addEventListener("click", ()=>{
    document.querySelector(".left").style.left = "-120%"
  })

  // Add an event to change volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    // console.log("Setting volume to",e.target.value)
    currentSong.volume = parseInt(e.target.value) / 100

    if(currentSong.volume > 0){
      document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute.svg","volume.svg")
    }
  })

  // Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click", async (item)=>{
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`);
      playMusic(songs[0])
    })
  })
   // Add an event listener to previous
   previous.addEventListener("click", () => {
    // document.querySelector(".songtime").innerHTML = "00:00 / 00:00" 
    currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1])
    }else {
      playMusic(songs[index])
    }
  })

  // Add an event listener to next
  next.addEventListener("click", () => {
    // document.querySelector(".songtime").innerHTML = "00:00 / 00:00" 
    currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1])
    } else {
      playMusic(songs[index])
    }
})

  // Add even listener to Mute the track
  let mute = document.querySelector(".volume > img")
  mute.addEventListener("click", e=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
      currentSong.volume = 0
    } else {
      e.target.src = e.target.src.replace("mute.svg","volume.svg")
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10
      currentSong.volume = .1
    }
  })
  

}

main() 

