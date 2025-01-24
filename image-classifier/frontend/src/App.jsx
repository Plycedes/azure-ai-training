import React, { useState } from "react";
import axios from "axios"; // Ensure you import Axios

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const [objectImage, setObjectImage] = useState(null);
    const [peopleImage, setPeopleImage] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Please upload an image file.");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/analyze-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setResults(response.data);

            // Assuming backend returns image URLs for annotated images
            setObjectImage(response.data.object_annotated_image);
            setPeopleImage(response.data.people_annotated_image);
        } catch (error) {
            console.error(error.message);
            alert("Failed to analyze the image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Azure AI Image Analysis</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 font-semibold text-white rounded-lg ${
                        loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? "Analyzing..." : "Analyze Image"}
                </button>
            </form>

            {results && (
                <div className="mt-8 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Analysis Results</h2>

                    {/* Caption */}
                    {results.caption && (
                        <p className="text-lg">
                            <strong>Caption:</strong> {results.caption.text} (
                            <span className="text-blue-600">
                                {results.caption.confidence.toFixed(2)}%
                            </span>
                            )
                        </p>
                    )}

                    {/* Tags */}
                    {results.tags && (
                        <div className="mt-4">
                            <strong className="text-lg">Tags:</strong>
                            <ul className="list-disc list-inside">
                                {results.tags.map((tag, index) => (
                                    <li key={index}>
                                        {tag.name} (
                                        <span className="text-blue-600">
                                            {tag.confidence.toFixed(2)}%
                                        </span>
                                        )
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Objects */}
                    {results.objects && (
                        <div className="mt-4">
                            <strong className="text-lg">Objects:</strong>
                            <ul className="list-disc list-inside">
                                {results.objects.map((obj, index) => (
                                    <li key={index}>
                                        {obj.name} (
                                        <span className="text-blue-600">
                                            {obj.confidence.toFixed(2)}%
                                        </span>
                                        )
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* People Detected */}
                    {results.people && (
                        <div className="mt-4">
                            <strong className="text-lg">People Detected:</strong>
                            <ul className="list-disc list-inside">
                                {results.people.map((person, index) => (
                                    <li key={index}>
                                        Confidence:{" "}
                                        <span className="text-blue-600">
                                            {person.confidence.toFixed(2)}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {objectImage && (
                        <div className="mt-4">
                            <h3 className="text-lg font-bold">Object Annotated Image</h3>
                            <img
                                src={`http://localhost:5000${objectImage}`}
                                alt="Object Annotated"
                                className="mt-2 max-w-full h-auto rounded-lg"
                            />
                        </div>
                    )}

                    {peopleImage && (
                        <div className="mt-4">
                            <h3 className="text-lg font-bold">People Annotated Image</h3>
                            <img
                                src={`http://localhost:5000${peopleImage}`}
                                alt="People Annotated"
                                className="mt-2 max-w-full h-auto rounded-lg"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
