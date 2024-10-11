import json
from flask import Flask, request, jsonify, abort # type: ignore
from flask_cors import CORS # type: ignore
from zeroconf import Zeroconf, ServiceInfo # type: ignore

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

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

@app.route('/enter-presentation', methods=['POST'])
def enter_presentation():
    data = request.json
        
    spk = data['speaker']
    voter_id = data['voter_id']
    
    if voter_id not in internal_IP_voters.keys():
        with open(speakers_file, 'r') as file:
            speakers = json.load(file)
            
        numberOfSpeakers = speakers['speakers'].__len__()
        dic = {
            "Vote": ""
        }
        for i in range(1, numberOfSpeakers + 1):
            dic[f"Speaker {i}"] = False
        internal_IP_voters[voter_id] = dic

    internal_IP_voters[voter_id][spk] = True
    return jsonify({"message": f"IP {voter_id} registered."}), 200

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
    voter_id = data['voter_id']
    
    # if voter_id in internal_IP_voters and check_voter_saw_everything(voter_id):
    if voter_id in internal_IP_voters:
        for speaker in spk['speakers']:
            if speaker['Id'] == internal_IP_voters[voter_id]["Vote"]:
                speaker['Member Votes'] -= 1
                break
        internal_IP_voters[voter_id]["Vote"] = int(vote)
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
    # add number of people that entered the presentation
    speakers['entered'] = len(internal_IP_voters)
    return jsonify(speakers)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
