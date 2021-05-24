//don't forget pull requests turns to pulls
//don't forget to give display if no user is found
//don't forget to change the token
//what shows when you catch an error
//checks if that particular name has been searched before
//star the star

const time= new Date();
const theMonth=time.getMonth();
const presentYear=time.getFullYear();
const presentDay=time.getDate();
const monthsArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
// let updateTime="2021-04-13T21:47:21Z"


//THIS PUTS THE CORRECT FORMAT FOR WHEN THE REPO WAS LAST UPDATED

function checkTiming(updateTime){
	
	let repoYear=updateTime.slice(0,4);
	let repoMonth=updateTime.slice(5,7);
	let repoDay=updateTime.slice(8,10);
	
	if(Number(repoYear)<presentYear){
		//this format is for when repo was updated years before
		
		return `Updated on ${repoDay} ${monthsArray[Number(repoMonth)]} ${repoYear}`
		
	}else if(Number(repoYear)===presentYear && Number(repoMonth)===theMonth+1){
		//all these are for when the repository was updated in the same month 
		let daysPassed=presentDay-Number(repoDay);
		
		if(daysPassed===0){
			return `Updated today`
		}else if(daysPassed===1){
			return `Updated yesterday`
		}
		
		return `Updated ${daysPassed} days ago`
		
	}else{
		//if the repo was updated months prior
		return `Updated on ${repoDay} ${monthsArray[Number(repoMonth)]}`
	}
}

//FETCH DATA FROM THE API
const mainSearch= document.querySelectorAll('.main-search');
const screenLoadingPage= document.querySelector('.screen-loader');//grabs the entire screen loadin page
let presentProfile;

mainSearch.forEach((search)=>{
	search.addEventListener('keydown',checkUser)
})


function checkUser(e){
	if(e.keyCode===13){
		
		if(e.currentTarget.value.length===0)return;//stops the event if nothing was typed
		if(e.currentTarget.value===presentProfile)return
		presentProfile=e.currentTarget.value
		
		screenLoadingPage.classList.remove('inactive');//displays the loading screen pending the fetched data
		
		let url="https://api.github.com/graphql";
		
		let newUser=e.currentTarget.value;//picks out the username from the from input
		
			//setup the query for the GRAPHql
	const query={
			"query":`
		query{ 
		  
		 user (login:"${newUser}") {
			id
			name
			login
			bio
			avatarUrl(size:1000)
			repositories(first:20) {
			  edges {
				node {
				  id
				  name
				  description
				  forkCount
				  primaryLanguage {
					name
				  }
				  updatedAt
				  stargazerCount
				}
			  }
			}
		  }
		}`
		};
		
		
			let h = new Headers();
			h.append("Content-Type", "application/json");
			// let encoded=window.btoa("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");
			let auth= "bearer " + "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";
			h.append('Authorization', auth);
			
			console.log(auth);
			
			let req= new Request(url,{
				method:'POST',
				headers:h,
				credentials:'same-origin',
				body: JSON.stringify(query)
			});
			
			fetch(req)
			.then(response => response.json())
		.then((data)=>{
			// console.log(JSON.stringify(data));
			const newData=JSON.stringify(data);
			const changedData=JSON.parse(newData);
			
			updatePage(changedData)//calls the function that changes the page
			
			screenLoadingPage.classList.add('inactive');//removes the loading screen
			console.log(changedData.data.user.repositories.edges)
		})
		.catch(err=>console.log(JSON.stringify(err)));
		
	}
	
}

// INSERT DATA FROM API INTO DOM
const mainAvatar= document.querySelector('.profile-avatar');//grabs the main profile picture
const miniAvi= document.querySelectorAll('.mini-avatar');//grabs the smaller profile pictures
const miniAviName= document.querySelector('.mini-avatar-name');
const profileName= document.querySelector('.profile-name');//grabs the profile name
const loginName= document.querySelector('.login-name');
const profileBio= document.querySelector('.profile-bio');
const totalRepDisplays= document.querySelectorAll('.total-repositories');
const respositoriesWrapper= document.querySelector('.respositories-wrapper');


function updatePage(rData){
	console.log('in here')
	//this changes the pictures
	mainAvatar.src=rData.data.user.avatarUrl;
	miniAvi.forEach((avi)=>{
		avi.src=rData.data.user.avatarUrl;
	})
	
	//this changes the Profile details
	profileName.innerText=rData.data.user.name;//the name
	miniAviName.innerText=rData.data.user.name;//the name
	loginName.innerText=rData.data.user.login;//login name
	profileBio.innerText=rData.data.user.bio;//the users bio
	
	//input the total number of repositories the user has
	let totalRepoLength=rData.data.user.repositories.edges.length//checks the length of all repos
	totalRepDisplays.forEach((repDisplay)=>{
		repDisplay.innerText=totalRepoLength //inputs it into the DOM
	})
	
	
	//input the repositories into the DOM
	let fullReposit=rData.data.user.repositories.edges//all the repositories the user has
	respositoriesWrapper.innerHTML=''//removes previous repositories in the DOM
	fullReposit.map((repository)=>{
		let {name,description,forkCount,primaryLanguage,
		updatedAt,stargazerCount}=repository.node;
		
		respositoriesWrapper.innerHTML+=`<article class="main-respository">
						<header class="main-respository-head">
							<div>
								<h3 class="respository-name">${name}</h3>
								<p>${description}</p>
							</div>
							
							<i class="far fa-star"><span class="the-star">Star</span></i>
						</header>
						
						
						<footer>
							<p class="rep-language"><i class="fas fa-circle"></i>${primaryLanguage.name}</p>
							<p><i class="far fa-star"></i>${stargazerCount}</p>
							<p><i class="fas fa-code-branch"></i>${forkCount}</p>
							<p>${checkTiming(updatedAt)}</p>
						</footer>
					</article>`
	})
	
	
	
	
	
	
}

//INSERT THE MINI AVATAR AT THE TOP AFTER LONG SCROLL
// const profileNameWrapper= document.querySelector('.profile-name-wrapper');
const miniAviArea=document.querySelector('.mini-avi-area');
const profileAvatar=document.querySelector('.profile-avatar');

const options={

	rootMargin: "1000% 0px -100% 0px",//the takes the observation area to the top outside the viewport
	threshold:1,
}

//this observes and checks if the main avatar is out of the browser
let observer=new IntersectionObserver(avatarCheck, options);
observer.observe(profileAvatar);

function avatarCheck(entries){
	
	entries.forEach((entry)=>{
		// console.log('seen',scrollY);
		
		//here if the MAIN avatar is in the observation area makes the mini avatar show
		if(entry.isIntersecting){
			return miniAviArea.classList.remove('invisible')
		}
		
		//vice versa to the above
		miniAviArea.classList.add('invisible')
		
	})
}
