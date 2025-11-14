#!/usr/bin/env python3
"""
Fetch upcoming events from Eventbrite API and save to JSON file.
Requires EVENTBRITE_TOKEN environment variable.
"""

import os
import json
import sys
from datetime import datetime, timezone
import requests

OUTPUT_FILE = "assets/data/eventbrite-upcoming.json"

def get_organization_id(headers):
    """Fetch the organization ID for the authenticated user."""
    print("Fetching organization ID...")
    
    url = 'https://www.eventbriteapi.com/v3/users/me/organizations/'
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        organizations = data.get('organizations', [])
        
        if not organizations:
            print("Error: No organizations found for this account")
            sys.exit(1)
        
        # Use the first organization
        org = organizations[0]
        org_id = org['id']
        org_name = org.get('name', 'Unknown')
        
        print(f"Found organization: {org_name} (ID: {org_id})")
        return org_id
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching organization: {e}")
        sys.exit(1)

def fetch_eventbrite_events():
    """Fetch events from Eventbrite API."""
    token = os.environ.get('EVENTBRITE_TOKEN')
    
    if not token:
        print("Error: EVENTBRITE_TOKEN environment variable not set")
        sys.exit(1)
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    
    # Get the organization ID
    organizer_id = get_organization_id(headers)
    
    # Fetch events for the organizer
    url = f'https://www.eventbriteapi.com/v3/organizations/{organizer_id}/events/'
    
    params = {
        'status': 'live',  # Only live/published events
        'order_by': 'start_asc',  # Soonest first
        'time_filter': 'current_future',  # Only upcoming events
        'expand': 'venue,ticket_availability',  # Get venue and ticket info
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        events = []
        now = datetime.now(timezone.utc)
        
        for event in data.get('events', []):
            # Parse event data
            start_date = event.get('start', {}).get('utc', '')
            end_date = event.get('end', {}).get('utc', '')
            
            # Skip if event already ended
            if end_date:
                try:
                    end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                    if end_dt < now:
                        continue
                except:
                    pass
            
            # Skip events with placeholder/incomplete content
            # These are often recurring event instances that haven't been fully created yet
            event_name = event.get('name', {}).get('text', '').strip()
            event_summary = event.get('summary', '').strip()
            event_description = event.get('description', {}).get('text', '').strip()
            
            # Skip if the event has placeholder text like "xxx" or "TBD" or is completely empty
            placeholder_indicators = ['xxx', 'tbd', 'tba', 'to be determined', 'to be announced']
            
            if not event_name or event_name.lower() in placeholder_indicators:
                print(f"Skipping event with placeholder name: {event_name}")
                continue
            
            if not event_summary or event_summary.lower() in placeholder_indicators:
                print(f"Skipping event '{event_name}' with placeholder summary: {event_summary}")
                continue
            
            if not event_description or event_description.lower() in placeholder_indicators:
                print(f"Skipping event '{event_name}' with placeholder description: {event_description}")
                continue
            
            # Extract venue info
            venue = event.get('venue', {})
            location = None
            if venue:
                location_parts = []
                if venue.get('address', {}).get('city'):
                    location_parts.append(venue['address']['city'])
                if venue.get('address', {}).get('region'):
                    location_parts.append(venue['address']['region'])
                location = ', '.join(location_parts) if location_parts else venue.get('name', 'Online')
            else:
                location = event.get('online_event', False) and 'Online' or 'TBC'
            
            # Get ticket availability
            ticket_availability = event.get('ticket_availability', {})
            is_sold_out = ticket_availability.get('is_sold_out', False)
            has_available_tickets = ticket_availability.get('has_available_tickets', True)
            
            # Build event object (using already parsed/validated strings)
            event_data = {
                'id': event.get('id'),
                'name': event_name,
                'summary': event_summary,
                'description': event_description,
                'url': event.get('url', ''),
                'start': start_date,
                'end': end_date,
                'location': location,
                'is_online': event.get('online_event', False),
                'logo_url': event.get('logo', {}).get('url', ''),
                'capacity': event.get('capacity', None),
                'is_free': event.get('is_free', False),
                'is_sold_out': is_sold_out,
                'has_available_tickets': has_available_tickets,
            }
            
            events.append(event_data)
        
        return {
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'organizer_id': organizer_id,
            'count': len(events),
            'events': events
        }
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching events: {e}")
        sys.exit(1)

def main():
    """Main function."""
    print("Fetching events from Eventbrite...")
    
    data = fetch_eventbrite_events()
    
    print(f"Found {data['count']} upcoming events")
    
    # Save to JSON file
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to {OUTPUT_FILE}")
    
    # Print summary
    for event in data['events']:
        print(f"  - {event['name']} ({event['start']}) - {event['location']}")

if __name__ == '__main__':
    main()
