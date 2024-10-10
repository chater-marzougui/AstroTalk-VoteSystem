import random
import os
import json
from flask import Flask, request, jsonify, abort # type: ignore
from flask_cors import CORS # type: ignore
from zeroconf import Zeroconf, ServiceInfo # type: ignore
import socket

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

votes_list = dict()
internal_IP_voters = dict()
speakers_file = 'speakers.json'

@app.route('/add-speaker', methods=['POST'])
def add_speaker():
    data = request.json
    with open(speakers_file, 'r') as file:
        spk = json.load(file)
    id = 0
    for speaker in spk['speakers']:
        if speaker['Id'] > id:
            id = speaker['Id']
            
    speaker = {
        "Id": id + 1,
        "name": data['name'],
        "photo": data['photo'],
        "project": data['project'],
        "Bureau Votes": {
            "Technical": 0,
            "Non-Technical": 0
        },
        "Member Votes": 0
    }
    spk['speakers'].append(speaker)
    with open(speakers_file, 'w') as file:
        json.dump(spk, file)
    return jsonify(speaker), 201

@app.route('/delete-speaker/<int:speaker_id>', methods=['DELETE'])
def delete_speaker(speaker_id):
    with open(speakers_file, 'r') as file:
        spk = json.load(file)
    for speaker in spk['speakers']:
        if speaker['Id'] == speaker_id:
            spk['speakers'].remove(speaker)
            with open(speakers_file, 'w') as file:
                json.dump(spk, file)
            return jsonify(speaker), 200
    return abort(404, "Speaker not found")

def get_voter_ip():
    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        return request.environ['REMOTE_ADDR']
    else:
        return request.environ['HTTP_X_FORWARDED_FOR'].split(',')[0].strip()

@app.route('/enter-presentation', methods=['POST'])
def enter_presentation():
    voter_ip = get_voter_ip()
    data = request.json
    with open(speakers_file, 'r') as file:
        speakers = json.load(file)
        
    numberOfSpeakers = speakers['speakers'].__len__()
    spk = data['speaker']

    if voter_ip not in internal_IP_voters.keys():
        dic = {
            "Vote": ""
        }
        for i in range(1, numberOfSpeakers + 1):
            dic[f"Speaker {i}"] = False
        internal_IP_voters[voter_ip] = dic

    internal_IP_voters[voter_ip][spk] = True
    return jsonify({"message": f"IP {voter_ip} registered."}), 200

def check_voter_saw_everything(voter_ip):
    for key in internal_IP_voters[voter_ip]:
        if key != "Vote" and not internal_IP_voters[voter_ip][key]:
            return False
    return True

@app.route('/member-vote', methods=['POST'])
def submit_vote():
    print(internal_IP_voters)
    data = request.json
    with open(speakers_file, 'r') as file:
        spk = json.load(file)
    vote = data['speaker']
    voter_ip = get_voter_ip()
    
    # if voter_ip in internal_IP_voters and check_voter_saw_everything(voter_ip):
    if voter_ip in internal_IP_voters:
        for speaker in spk['speakers']:
            if speaker['Id'] == internal_IP_voters[voter_ip]["Vote"]:
                speaker['Member Votes'] -= 1
                break
        internal_IP_voters[voter_ip]["Vote"] = int(vote)
    else:
        return abort(404, "Not allowed")
    
    for speaker in spk['speakers']:
        if speaker['Id'] == int(vote):
            speaker['Member Votes'] += 1
            break

    with open(speakers_file, 'w') as file:
        json.dump(spk, file)

    return 'Vote submitted successfully!', 200


@app.route('/bureau-vote', methods=['POST'])
def submit_bureau_vote():
    data = request.json
    with open(speakers_file, 'r') as file:
        spk = json.load(file)
    votes = data['votes']
    for vote in votes:
        speaker_id = vote['Id']
        for speaker in spk['speakers']:
            if speaker['Id'] == speaker_id:
                speaker['Bureau Votes'] = vote['Bureau Votes']
                break
    with open(speakers_file, 'w') as file:
        json.dump(spk, file)
    return 'Vote submitted successfully!', 200

@app.route('/speakers', methods=['GET'])
def get_speakers():
    with open(speakers_file, 'r') as file:
        speakers = json.load(file)
    return jsonify(speakers)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
