import { keys, makeAutoObservable, runInAction } from "mobx"
import { Activity } from "../models/activity"
import agent from "../api/agent";
import {v4 as uuid} from 'uuid'
import { act } from "react";
export default class ActivityStore{
   activityRegistry = new Map<string,Activity>();
   selectedActivities: Activity | undefined = undefined;
   editMode = false;
   loading = false;
   loadingInitial = false;
    
    constructor() {
        makeAutoObservable(this)
    }

    get activitiesByDate(){
        return Array.from(this.activityRegistry.values()).sort((a,b) => Date.parse(a.date) - Date.parse(b.date));
    }

    get groupActivities(){
        return Object.entries(
            this.activitiesByDate.reduce((acitvities,activity) => {
                const date = activity.date;
                acitvities[date] = acitvities[date] ? [...acitvities[date],activity] : [activity];
                return acitvities;
            },{} as {[key:string]: Activity[]})
        )
    }

    loadActivities = async() => {
     this.setLoadingInitial(true);
        try {
            const activities = await agent.Activities.list();
           
                activities.data.forEach(activity => {
                   this.setActivity(activity);
                  })
                  this.setLoadingInitial(false);
            
        } catch (error) {
            console.log(error);
           
                this.setLoadingInitial(false);
          
        }
    }

    loadActivity = async(id:string) => {
        let activity = this.getActivity(id);
        if(activity){
            this.selectedActivities = activity;
            return activity;
        }
        else{
            this.setLoadingInitial(true);
            try {
                activity = await agent.Activities.details(id);
                this.setActivity(activity);
                this.setLoadingInitial(false);
               runInAction(() => this.selectedActivities = activity);
                return activity;
            } catch (error) {
                console.log(error);
                this.setLoadingInitial(false);
            }
        }
    }

    private getActivity = (id:string) => {
        return this.activityRegistry.get(id);
    }

    private setActivity = (activity: Activity) => {
        activity.date = activity.date.split('T')[0];
        this.activityRegistry.set(activity.id,activity);
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }

    addActivity = async(activity: Activity) => {
        this.loading = true;
        activity.id = uuid();

        try {
            await agent.Activities.add(activity);
            
            runInAction(() => {
                this.activityRegistry.set(activity.id,activity);
                this.selectedActivities = activity;
                this.editMode = false;
                this.loading = false;
            })

        } catch (error) {
            console.log(error)
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    updateActivity = async(activity: Activity) => {
        this.loading = true;
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
               this.activityRegistry.set(activity.id,activity);
               this.selectedActivities = activity;
               this.loading = false;
               this.editMode = false;
            })
            
        } catch (error) {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    deleteActivity = async(id: string) => {
        this.loading = true;
        
        try {
            await agent.Activities.delete(id);
            
            runInAction(() => {
                this.activityRegistry.delete(id);
                this.loading = false;
            })
        } catch (error) {
            console.log(error)

            runInAction(() => {
                this.loading = false;
            })
        }
    }
}