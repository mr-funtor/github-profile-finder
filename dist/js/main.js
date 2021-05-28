//don't forget to change the token

const time= new Date();
const theMonth=time.getMonth();
const presentYear=time.getFullYear();
const presentDay=time.getDate();
const monthsArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']


//THIS PUTS THE CORRECT TIME FORMAT FOR WHEN A REPO WAS LAST UPDATED

function checkTiming(updateTime){
	
	//the time comes as a string, so slicing out the various timings is important
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

//TAKES US BACK TO HOME SCREEN
const gitIcon=document.querySelectorAll('.fa-github');
const hiddenHomeItems=document.querySelectorAll('.homer');
let onHomeScreen=true;
gitIcon.forEach((icon)=>{
	
	
	icon.addEventListener('click', ()=>{
		if(onHomeScreen)return showDialogue('Already on home page');//checks if the user is on the home screen
		
		screenLoadingPage.classList.remove('inactive');//displays the loading screen 
		
		hiddenHomeItems.forEach((item)=>{
			if(item.classList.contains('main-nav') || item.classList.contains('main-nav-sec') ){
					return item.classList.add('home-tune')//rearranges/restores the format of the top nav 
				}
				
			item.classList.add('home')//readjusts top icons
				
				
		})
		
			homeScreen.classList.remove('home')//adds the welcome message and input back to the page
			
			pageTitle.innerText='Github Users Finder'//changes the page title name;
			setTimeout(()=>{
				screenLoadingPage.classList.add('inactive');//removes the loading screen
			},500)
			 
			
			onHomeScreen=true//keeps track that the user is now on the home screen
	})
	
	
})


//FETCHS DATA FROM THE API
const mainSearch= document.querySelectorAll('.main-search');
const screenLoadingPage= document.querySelector('.screen-loader');//grabs the entire screen loadin page
const homeScreen= document.querySelector('.home-screen');//grabs the entire screen loadin page
let presentProfile;

mainSearch.forEach((search)=>{
	search.addEventListener('keydown',checkUser)
})


async function checkUser(e){
	
	if(e.keyCode===13){
		
		if(e.currentTarget.value.length===0)return showDialogue('no name was searched')//stops the event if nothing was typed
		if(e.currentTarget.value===presentProfile && !onHomeScreen)return showDialogue('Same profile as before')//crosschecks if the profile is what was just typed
		presentProfile=e.currentTarget.value;
		
		
		screenLoadingPage.classList.remove('inactive');//displays the loading screen pending the fetched data
		
		
		let url="https://api.github.com/graphql";
		
		let newUser=e.currentTarget.value.toLowerCase();//picks out the username from the from input
		
		mainSearch.forEach((search)=>{
			if(e.currentTarget!==search)search.value='';
			if(onHomeScreen && e.currentTarget==search)e.currentTarget.value='';
		})
		
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
				totalCount
			  edges {
				node {
				  id
				  name
				  description
				  forkCount
				  primaryLanguage {
					name
					color
				  }
				  updatedAt
				  stargazerCount
				}
			  }
			}
		  }
		}`
		};
		
		
		const response= await fetch('/.netlify/functions/getUser');
		const data = await response.json();
		
			let h = new Headers();
			h.append("Content-Type", "application/json");
			let auth= "bearer " + data.msg;
			h.append('Authorization', auth);
			
			
			let req= new Request(url,{
				method:'POST',
				headers:h,
				credentials:'same-origin',
				body: JSON.stringify(query)
			});
			
			fetch(req)
			.then(response => response.json())
		.then((data)=>{
			const newData=JSON.stringify(data);
			const changedData=JSON.parse(newData);
			
			updatePage(changedData)//calls the function that changes the profile
			showRepositories(changedData,'profile')//this sieves the data to know if it's all respositories or a single
			
			
			//this changes the layout of the page from what it looks like on the home screen
			hiddenHomeItems.forEach((item)=>{
				item.classList.remove('home')//readjusts top icons
				
				if(item.classList.contains('home-tune')){
					item.classList.remove('home-tune')//restores the format top nav 
				}
			})
		
			homeScreen.classList.add('home')//removes the msg and input on the home screen
			
			screenLoadingPage.classList.add('inactive');//removes the loading screen
			
			onHomeScreen=false//keeps track that the user is now off on the home screen
		})
		.catch((err)=>{
			//where there is an error because a wrong name was typed
			screenLoadingPage.classList.add('inactive');//removes the loading screen
			showDialogue('No user found')
		});
		
	}
	
}

// INSERT DATA FROM API
const mainAvatar= document.querySelector('.profile-avatar');//grabs the main profile picture
const miniAvi= document.querySelectorAll('.mini-avatar');//grabs the smaller profile pictures
const miniAviName= document.querySelector('.mini-avatar-name');
const profileName= document.querySelector('.profile-name');//grabs the profile name
const loginName= document.querySelector('.login-name');
const profileBio= document.querySelector('.profile-bio');
const totalRepDisplays= document.querySelectorAll('.total-repositories');
const respositoriesWrapper= document.querySelector('.respositories-wrapper');
const searchRepositoriesDisp=document.querySelector('.respositories-number');
const pageTitle=document.querySelector('.fullPage-title');


//THIS UPDATES THE PROFILE AND REPOSITORIES COUNT
function updatePage(rData){
	
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
	pageTitle.innerText=rData.data.user.name || 'Github User'//changes the page title name;
	
	//input the total number of repositories the user has
	let totalRepoLength=rData.data.user.repositories.totalCount//checks the length of all repos
	totalRepDisplays.forEach((repDisplay)=>{
		repDisplay.innerText=totalRepoLength //inputs it into the DOM
	})
	
	//input the total number of repositories showing
	let searchedLength=rData.data.user.repositories.edges.length
	searchRepositoriesDisp.innerText=`${searchedLength} results for public repositories`
}

//SIEVES THE REPOSITORIES 
function showRepositories(rData,hook){
		let fullReposit;
		
		//the use of a hook here is for the program to know if it's single/all the repos that is searched for
	if(hook==='singleRepo'){
		fullReposit=[rData.data.user.repository]//the single repository searched for
	}else{
		fullReposit=rData.data.user.repositories.edges//all the repositories the user has
	}
	
	respositoriesWrapper.innerHTML=''//removes previous repositories in the DOM
	
	fullReposit.map((repository)=>{
		if(hook==='singleRepo'){
			repDomUpdate(repository)//this function updates the repo to the DOM with the data
		}else{
			repDomUpdate(repository.node)
		}	
	})
	
}

//UPDATES THE REPOSITORIES SECTION IN THE DOM

function repDomUpdate(repoData){
	
	let {name,description,forkCount,primaryLanguage,
		updatedAt,stargazerCount}=repoData;
	
	if(primaryLanguage===null)primaryLanguage={name:'none'}//this prevents a bug in case primaryLanguage returns null
	
		respositoriesWrapper.innerHTML+=`<article class="main-respository">
						<header class="main-respository-head">
							<div>
								<h3 class="respository-name">${name}</h3>
								<p>${description}</p>
							</div>
							
							<i class="far fa-star star-click"><span class="the-star">Star</span></i>
						</header>
						
						
						<footer>
							<p ><i class="fas fa-circle " style="color:${primaryLanguage.color};"></i>${primaryLanguage.name}</p>
							<p><i class="far fa-star"></i>${stargazerCount}</p>
							<p><i class="fas fa-code-branch"></i>${forkCount}</p>
							<p>${checkTiming(updatedAt)}</p>
						</footer>
					</article>`


	//makes the stars just created above change on click
	const allStar= document.querySelectorAll('.star-click');
	const starWord= document.querySelectorAll('.the-star');
	
	allStar.forEach((star)=>{
		star.addEventListener('click',(e)=>{
			if(!e.currentTarget.classList.contains('starred')){
				e.currentTarget.classList="fas fa-star star-click starred"
				e.currentTarget.firstElementChild.innerText='Unstar'
				return
			}
			e.currentTarget.classList="far fa-star star-click"
			e.currentTarget.firstElementChild.innerText='Star'
			
			
		})
	})
			
}

//DISPLAYING THE DIALOGUE/ERORR BOX
const dialogueBox=document.querySelector('.error-box');

function showDialogue(msg){
	dialogueBox.firstElementChild.innerText=msg;
	dialogueBox.classList.add('active');
	
	setTimeout(()=>{
		dialogueBox.classList.remove('active');
	},2000)
}

//DENYING ACCESS TO SEARCHING REPOSITORY
const repoSearchInput=document.getElementById('repository-search');

repoSearchInput.addEventListener('keydown',denySearch)

function denySearch(e){
	if(e.keyCode===13){
		showDialogue('Access denied')
	}
}

const accessElements=document.querySelectorAll('.access');
accessElements.forEach((elem)=>{
	elem.addEventListener('click',()=>{
		showDialogue('Access denied')
	})
})


//INSERT THE MINI AVATAR AT THE TOP AFTER LONG SCROLL
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
		
		//here, if the MAIN avatar is in the observation area, make the mini avatar show
		if(entry.isIntersecting){
			return miniAviArea.classList.remove('invisible')
		}
		
		//vice versa to the above
		miniAviArea.classList.add('invisible')
		
	})
}
